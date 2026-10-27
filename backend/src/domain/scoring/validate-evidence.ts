import type { Requirement } from "@/domain/repositories/scoring.contract";

export function normalize(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export function validateEvidence(
  requirements: Requirement[],
  resume: string,
  vacancy: string,
) {
  const seen = new Set<string>();
  const normalizedResume = normalize(resume);
  const normalizedVacancy = normalize(vacancy);
  return requirements.map((r) => {
    const key = normalize(r.description);
    if (seen.has(key)) throw new Error("Requisito duplicado na resposta.");
    seen.add(key);
    if (!normalizedVacancy.includes(normalize(r.source)))
      throw new Error("Requisito sem trecho rastreável na vaga.");
    if (
      (r.classification === "met" || r.classification === "partial") &&
      (!r.evidence || !normalizedResume.includes(normalize(r.evidence)))
    )
      return {
        ...r,
        classification: "confirm" as const,
        evidence: null,
        explanation:
          "A evidência não pôde ser localizada no currículo. Confirme esta informação.",
      };
    if (
      r.dimension === "seniority" &&
      /\b\d+\s*(anos?|meses)\b/i.test(r.source) &&
      ["met", "partial"].includes(r.classification)
    )
      return {
        ...r,
        classification: "confirm" as const,
        explanation:
          "O tempo de experiência relevante precisa de confirmação. Datas em texto livre não são somadas automaticamente; períodos simultâneos não podem ser contados duas vezes.",
      };
    if (r.evidence && !normalizedResume.includes(normalize(r.evidence)))
      return { ...r, evidence: null, classification: "confirm" as const };
    return r;
  });
}
