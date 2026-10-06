import { validateReasoning, type ReasoningContext, type ReasoningModel, type ReasoningReport } from "../domain/reasoning";

/** The language model proposes analysis only; no authorization or execution port is available. */
export async function reasonAgent(context: ReasoningContext, model: ReasoningModel, id: string): Promise<ReasoningReport> {
  const evidence = structuredClone(context.run?.evidence ?? []);
  const result = await model.infer(context);
  if (!result.model || !result.responseId) throw new Error("missing_model_provenance");
  return {
    id, agentId: context.agentId, language: context.language, createdAt: new Date().toISOString(),
    model: result.model, provider: "openai", providerResponseId: result.responseId,
    sourceRunId: context.run?.id ?? null, sourceAt: context.sourceAt, evidence,
    analysis: validateReasoning(result.value, evidence.length), executionAllowed: false,
  };
}
