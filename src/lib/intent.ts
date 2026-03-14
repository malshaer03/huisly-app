import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

/**
 * Intent types that the AI can classify user messages into
 */
export type Intent = "SEARCH" | "UPDATE_PREFS" | "CHITCHAT";

/**
 * Extracted search parameters from user intent
 */
export interface SearchParams {
  city?: string;
  budget_max?: number;
  move_date?: string; // ISO date string
  room_type?: string; // 'studio' | 'apartment' | 'room'
  furnished?: boolean;
  pets?: boolean;
  min_size_m2?: number;
}

/**
 * Result of intent extraction
 */
export interface ExtractedMessage {
  intent: Intent;
  params: SearchParams;
  confidence: "high" | "medium" | "low";
}

/**
 * Extract intent and parameters from a user message
 * Uses Claude Haiku to classify and extract structured data
 */
export async function extractIntent(
  userMessage: string,
  apiKey: string,
): Promise<ExtractedMessage> {
  const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const extractionPrompt = `Extract housing search parameters from this message:

Message: "${userMessage}"

Return JSON ONLY. No markdown or explanation. Use null for unknown fields.
{"intent":"SEARCH"|"CHITCHAT","params":{"city":"Amsterdam"|null,"budget_max":1000|null,"room_type":"studio"|"apartment"|"room"|null,"furnished":true|false|null}}`;

  try {
    const { text: extracted } = await generateText({
      model: openai.chat("anthropic/claude-3.5-haiku"),
      prompt: extractionPrompt,
    });

    console.log("Raw LLM response:", extracted);

    const result = JSON.parse(extracted.trim());
    console.log("Parsed JSON:", result);

    // Validate and clean up the response
    const cleanedParams = Object.fromEntries(
      Object.entries(result.params || {}).filter(
        ([, v]) => v !== null && v !== undefined,
      ),
    ) as SearchParams;

    const finalResult = {
      intent: result.intent || "CHITCHAT",
      params: cleanedParams,
      confidence: result.confidence || "medium",
    };

    console.log("Final extracted intent:", finalResult);
    return finalResult;
  } catch (error) {
    // If parsing fails, default to CHITCHAT to avoid breaking the conversation
    console.error("Intent extraction failed:", error);
    return {
      intent: "CHITCHAT",
      params: {},
      confidence: "low",
    };
  }
}
