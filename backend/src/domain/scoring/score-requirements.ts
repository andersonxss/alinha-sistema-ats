import type {
  Requirement,
  ScoringResult,
} from "@/domain/repositories/scoring.contract";
import { requirementDimensions } from "@/domain/repositories/scoring.contract";
import {
  classificationValues,
  dimensionLabels,
  requirementWeight,
  weights,
} from "./scoring-policy";

export function scoreRequirements(requirements: Requirement[]): ScoringResult {
  const active = requirementDimensions.filter((d) =>
    requirements.some((r) => r.dimension === d),
  );
  if (!active.length)
    throw new Error("Não há requisitos suficientes para calcular a nota.");
  const totalWeight = active.reduce((s, d) => s + weights[d], 0);
  const dimensions = active.map((d) => {
    const items = requirements.filter((r) => r.dimension === d);
    const total = items.reduce((s, r) => s + requirementWeight(r.mandatory), 0);
    return {
      dimension: d,
      label: dimensionLabels[d],
      weight: (weights[d] / totalWeight) * 100,
      score:
        (items.reduce(
          (s, r) =>
            s +
            classificationValues[r.classification] *
              requirementWeight(r.mandatory),
          0,
        ) /
          total) *
        100,
    };
  });
  const evaluated = requirements.map((r) => {
    const dim = dimensions.find((d) => d.dimension === r.dimension);
    if (!dim) throw new Error("Dimensão de pontuação inválida.");
    const total = requirements
      .filter((x) => x.dimension === r.dimension)
      .reduce((s, x) => s + requirementWeight(x.mandatory), 0);
    return {
      ...r,
      contribution:
        ((dim.weight * requirementWeight(r.mandatory)) / total) *
        classificationValues[r.classification],
    };
  });
  return {
    score: Math.round(evaluated.reduce((s, r) => s + r.contribution, 0)),
    provisional: requirements.some((r) => r.classification === "confirm"),
    dimensions,
    requirements: evaluated,
  };
}
