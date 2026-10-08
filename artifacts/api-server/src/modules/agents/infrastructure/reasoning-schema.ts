/** Mirror the domain bounds before inference, including the actual evidence set. */
export function reasoningSchema(evidenceCount: number) {
  if (!Number.isSafeInteger(evidenceCount) || evidenceCount < 0) throw new Error("invalid_evidence_count");
  const textArray = { type: "array", maxItems: 10, items: { type: "string", minLength: 1, maxLength: 1200 } };
  return {
    type: "object", additionalProperties: false,
    required: ["summary", "observations", "uncertainties", "nextSteps", "recommendation", "evidenceIndices"],
    properties: {
      summary: { type: "string", minLength: 1, maxLength: 2400 },
      observations: textArray, uncertainties: textArray, nextSteps: textArray,
      recommendation: { type: "string", enum: evidenceCount ? ["monitor", "abstain", "review"] : ["abstain", "review"] },
      evidenceIndices: {
        type: "array", maxItems: evidenceCount ? 20 : 0,
        items: { type: "integer", minimum: 0, maximum: Math.max(0, evidenceCount - 1) },
      },
    },
  };
}
