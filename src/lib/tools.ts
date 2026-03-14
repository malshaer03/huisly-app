import type OpenAI from "openai";

export const HUISLY_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_listings",
      description: `Search for housing listings in the Netherlands.
Call this tool immediately when the user mentions ANY housing criteria.

EXAMPLES that must trigger this tool:
- "amsterdam under 1k" → city: Amsterdam, budget_max: 1000
- "looking for something in rotterdam" → city: Rotterdam
- "need a studio around 900" → room_type: studio, budget_max: 900
- "under 1500 furnished" → budget_max: 1500, furnished: true
- "I want to move to utrecht in april" → city: Utrecht

Call even if only ONE parameter is mentioned — search first, refine after.
When in doubt, call this tool. Never chitchat if there is ANY housing signal.`,
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City or area name e.g. Amsterdam, Utrecht, Rotterdam",
          },
          budget_max: {
            type: "number",
            description: "Maximum monthly rent in EUR",
          },
          room_type: {
            type: "string",
            enum: ["room", "studio", "apartment", "house"],
            description: "Type of accommodation",
          },
          furnished: {
            type: "boolean",
            description: "true = furnished only, false = unfurnished only",
          },
          min_size_m2: {
            type: "number",
            description: "Minimum size in square meters",
          },
          move_date: {
            type: "string",
            description: "Move-in date ISO format YYYY-MM-DD",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_preferences",
      description: `Update previously stated housing preferences.
Trigger on: "actually", "change", "update", "instead", "make it", "correction".
Example: "actually make the budget 1500" → budget_max: 1500`,
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City or area name",
          },
          budget_max: {
            type: "number",
            description: "Maximum monthly rent in EUR",
          },
          room_type: {
            type: "string",
            enum: ["room", "studio", "apartment", "house"],
            description: "Type of accommodation",
          },
          furnished: {
            type: "boolean",
            description: "Furnished or unfurnished",
          },
          min_size_m2: {
            type: "number",
            description: "Minimum size in square meters",
          },
          move_date: {
            type: "string",
            description: "Move-in date ISO format YYYY-MM-DD",
          },
        },
      },
    },
  },
];

export interface ToolInput {
  city?: string;
  budget_max?: number;
  room_type?: "room" | "studio" | "apartment" | "house";
  furnished?: boolean;
  min_size_m2?: number;
  move_date?: string;
}
