import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(2000).default(""),
  tokens: z.array(z.string().min(10)).max(1000),
  url: z.string().default("/notices"),
});

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith("{") ? raw : atob(raw);
    const sa = JSON.parse(text) as Partial<ServiceAccount>;
    if (!sa.client_email || !sa.private_key || !sa.project_id) return null;
    return sa as ServiceAccount;
  } catch (e) {
    console.error("FCM service account parse failed", e);
    return null;
  }
}

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export const sendNoticeNotifications = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const sa = loadServiceAccount();
    if (!sa) {
      return {
        ok: false as const,
        error: "Push notifications are not configured (set FCM_SERVICE_ACCOUNT_JSON).",
        sent: 0,
        failed: 0,
      };
    }
    if (data.tokens.length === 0) {
      return { ok: true as const, sent: 0, failed: 0, invalidTokens: [] as string[] };
    }

    let accessToken: string;
    try {
      accessToken = await getAccessToken(sa);
    } catch (e) {
      console.error("FCM auth failed", e);
      return { ok: false as const, error: "Failed to authenticate with FCM.", sent: 0, failed: 0 };
    }

    const endpoint = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
    let sent = 0;
    let failed = 0;
    const invalidTokens: string[] = [];

    await Promise.all(
      data.tokens.map(async (token) => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token,
                notification: { title: data.title, body: data.body },
                data: { url: data.url, title: data.title, body: data.body },
                webpush: { fcmOptions: { link: data.url } },
              },
            }),
          });
          if (res.ok) {
            sent++;
          } else {
            failed++;
            if (res.status === 404 || res.status === 400) invalidTokens.push(token);
          }
        } catch {
          failed++;
        }
      }),
    );

    return { ok: true as const, sent, failed, invalidTokens };
  });