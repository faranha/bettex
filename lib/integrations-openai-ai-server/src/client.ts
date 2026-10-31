import OpenAI from "openai";

// OpenAI-compatible provider. OPENAI_API_KEY / OPENAI_BASE_URL are preferred;
// the legacy AI_INTEGRATIONS_OPENAI_* names are still accepted.
const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

if (!apiKey) {
  throw new Error("OPENAI_API_KEY must be set to use the OpenAI integration.");
}

export const openai = new OpenAI({ apiKey, baseURL });
