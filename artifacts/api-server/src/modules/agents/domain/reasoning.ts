import type { AgentEvidence, AgentRun } from "./operations";

export type ReasoningLanguage = "pt" | "en" | "es";
export type ReasoningAnalysis = {
  summary: string; observations: string[]; uncertainties: string[]; nextSteps: string[];
  recommendation: "monitor" | "abstain" | "review"; evidenceIndices: number[];
};
export type ReasoningReport = {
  id: string; agentId: string; language: ReasoningLanguage; createdAt: string;
  model: string; provider: "openai"; providerResponseId: string;
  sourceRunId: string | null; sourceAt: string; evidence: AgentEvidence[];
  analysis: ReasoningAnalysis; executionAllowed: false;
};
export type ReasoningContext = {
  agentId: string; language: ReasoningLanguage; sourceAt: string;
  rules: string[]; dependencies: string[]; run: AgentRun | null;
};
export interface ReasoningModel {
  infer(context: ReasoningContext): Promise<{ value: unknown; model: string; responseId: string }>;
}

/** Validate generated output without replacing failed inference with a scripted answer. */
export function validateReasoning(value: unknown, evidenceCount: number): ReasoningAnalysis {
  if (!value || typeof value !== "object") throw new Error("invalid_model_output");
  const v = value as Record<string, unknown>;
  const text = (s: unknown, max: number): s is string => typeof s === "string" && s.trim().length > 0 && s.length <= max;
  if (!text(v.summary, 2400) || !["monitor", "abstain", "review"].includes(String(v.recommendation))) throw new Error("invalid_model_output");
  for (const key of ["observations", "uncertainties", "nextSteps"]) {
    if (!Array.isArray(v[key]) || v[key].length > 8 || !v[key].every(s => text(s, 1200))) throw new Error("invalid_model_output");
  }
  if (!Array.isArray(v.evidenceIndices) || v.evidenceIndices.length > 20 ||
    !v.evidenceIndices.every(i => typeof i === "number" && Number.isSafeInteger(i) && i >= 0 && i < evidenceCount)) throw new Error("invalid_model_evidence");
  if (evidenceCount === 0 && v.recommendation === "monitor") throw new Error("unsupported_model_recommendation");
  return {
    summary: v.summary, observations: v.observations as string[], uncertainties: v.uncertainties as string[],
    nextSteps: v.nextSteps as string[], recommendation: v.recommendation as ReasoningAnalysis["recommendation"],
    evidenceIndices: [...new Set(v.evidenceIndices as number[])],
  };
}
