import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChatMessage = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  messages: z.array(ChatMessage).min(1).max(40),
});

const SYSTEM_PROMPT =
  "You are jai.ai, the helpful assistant for Jai Bharat Junior College in Hanamkonda, Telangana. " +
  "Help students with study guidance, exam preparation, and college-related queries. " +
  "Be concise, friendly, and accurate. If unsure, say so.";

export const chatWithJaiAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        error:
          "jai.ai is not configured yet. The site owner needs to add an OPENROUTER_API_KEY environment variable.",
      };
    }

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
    const referer = process.env.OPENROUTER_SITE_URL || "https://jai-bharat.local";

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": "Jai Bharat Junior College",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("OpenRouter error", res.status, text);
        if (res.status === 401 || res.status === 403) {
          return { ok: false as const, error: "AI service authentication failed. Please contact the administrator." };
        }
        if (res.status === 429) {
          return { ok: false as const, error: "jai.ai is busy right now. Please try again in a moment." };
        }
        return { ok: false as const, error: "jai.ai couldn't respond right now. Please try again." };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = json.choices?.[0]?.message?.content?.trim() || "";
      if (!reply) {
        return { ok: false as const, error: "Empty response from jai.ai." };
      }
      return { ok: true as const, reply };
    } catch (e) {
      console.error("jai.ai fetch failed", e);
      return { ok: false as const, error: "Network error reaching jai.ai." };
    }
  });