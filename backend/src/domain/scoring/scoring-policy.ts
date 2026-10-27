import type {
  RequirementClassification,
  RequirementDimension,
} from "@/domain/repositories/scoring.contract";

export const weights = {
  technical: 35,
  responsibilities: 30,
  seniority: 15,
  education: 10,
  languages: 10,
} as const satisfies Record<RequirementDimension, number>;
export const dimensionLabels: Record<RequirementDimension, string> = {
  technical: "Competências técnicas",
  responsibilities: "Experiências e responsabilidades",
  seniority: "Senioridade e experiência",
  education: "Formação e certificações",
  languages: "Idiomas e outros requisitos",
};

export const classificationLabels: Record<RequirementClassification, string> = {
  met: "Atendido",
  partial: "Parcialmente atendido",
  missing: "Não evidenciado",
  confirm: "Precisa de confirmação",
};

export const classificationValues = {
  met: 1,
  partial: 0.5,
  missing: 0,
  confirm: 0,
} as const satisfies Record<RequirementClassification, number>;

export function requirementWeight(mandatory: boolean): number {
  return mandatory ? 2 : 1;
}
