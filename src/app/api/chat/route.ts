import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const SYSTEM_PROMPT = `You are Huisly, a conversational housing agent for the Netherlands.
Help users find rental housing. Ask about city, budget, move date, and preferences.
Keep responses concise and warm. Respond in plain text only (no markdown).`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.OPEN_ROUTER_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPEN_ROUTER_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const result = streamText({
    model: openai.chat("anthropic/claude-3.5-haiku"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
