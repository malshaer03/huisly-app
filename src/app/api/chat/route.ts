import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { formatListingsForAI, searchListings } from "@/lib/db";

const SYSTEM_PROMPT = `You are Huisly, a conversational housing agent for the Netherlands.
Help users find rental housing. Ask about city, budget, move date, and preferences.
Keep responses concise and warm. Respond in plain text only (no markdown).

RENDER DIRECTIVES:
When showing listings, embed render directives inline in your message.
Format: render/{"type":"listing","data":{...}}
Each directive must be on its own line.
Always include: id, price, city, size_m2, furnished, available_from, room_type, source, contact_method, post_url
Example response format:
"I found 2 matches in Amsterdam under €1,000:
render/{"type":"listing","data":{"id":"1","price":950,"city":"Amsterdam","size_m2":32,"furnished":true,"available_from":"2025-04-01","room_type":"studio","source":"pararius","contact_method":"email","post_url":"https://pararius.nl/..."}}
render/{"type":"listing","data":{"id":"2","price":980,"city":"Amsterdam","size_m2":28,"furnished":false,"available_from":"2025-03-15","room_type":"room","source":"facebook","contact_method":"facebook_dm","post_url":"https://facebook.com/..."}}
Want me to narrow it down or send an application?"
IMPORTANT:
- Never make up listing data — only use what the tool result provides
- If no listings found, say so warmly and suggest broadening the search
- Always end with a follow-up question`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const modelMessages = await convertToModelMessages(messages);

  // Claude call — detects housing intent, calls search_listings tool, then responds
  // with render directives embedded in text for frontend to parse into ListingCards
  const result = streamText({
    model: openai.chat("anthropic/claude-3.5-haiku"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(2),
    tools: {
      search_listings: tool({
        description: `Search for housing listings in the Netherlands.
Call this tool ONLY when the user is actively requesting a new search or changing their search criteria.

CALL when the user:
- Describes where they want to live ("amsterdam", "looking in rotterdam")
- States a budget ("under 1k", "around €900", "max 1500")
- Asks to see listings ("show me", "find me", "what's available")
- Changes criteria ("actually make it €1200", "try utrecht instead")

DO NOT call when the user:
- Responds to listings already shown ("okay", "sounds good", "thanks")
- Asks a follow-up about a specific listing ("tell me more about the first one")
- Greets or makes small talk ("hi", "hello", "that's helpful")
- Confirms or declines a suggestion without new criteria`,
        inputSchema: z.object({
          city: z
            .string()
            .optional()
            .describe("City or area name e.g. Amsterdam, Utrecht, Rotterdam"),
          budget_max: z
            .number()
            .optional()
            .describe("Maximum monthly rent in EUR"),
          room_type: z
            .enum(["room", "studio", "apartment", "house"])
            .optional()
            .describe("Type of accommodation"),
          furnished: z
            .boolean()
            .optional()
            .describe("true = furnished only, false = unfurnished only"),
          min_size_m2: z
            .number()
            .optional()
            .describe("Minimum size in square meters"),
          move_date: z
            .string()
            .optional()
            .describe("Move-in date ISO format YYYY-MM-DD"),
        }),
        execute: async (params) => {
          const listings = await searchListings(params);
          return formatListingsForAI(listings);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
