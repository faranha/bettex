import artifacts from "./verified-artifacts.json" with { type: "json" };

/** Ignore only compiler-declared immutable slots; callers must verify their links. */
export function matchesContractRuntime(code: string, name: keyof typeof artifacts) {
  const artifact = artifacts[name];
  if (code.length !== artifact.runtime.length) return false;
  const normalize = (value: string) => {
    let bytes = value.slice(2).toLowerCase();
    for (const references of Object.values(artifact.immutableReferences)) {
      for (const ref of references) bytes = bytes.slice(0, ref.start * 2)
        + "0".repeat(ref.length * 2) + bytes.slice((ref.start + ref.length) * 2);
    }
    return bytes;
  };
  return normalize(code) === normalize(artifact.runtime);
}
