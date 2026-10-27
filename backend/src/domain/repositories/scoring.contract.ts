export const requirementDimensions = [
  "technical",
  "responsibilities",
  "seniority",
  "education",
  "languages",
] as const;

export const requirementClassifications = [
  "met",
  "partial",
  "missing",
  "confirm",
] as const;

export type RequirementDimension = (typeof requirementDimensions)[number];
export type RequirementClassification =
  (typeof requirementClassifications)[number];

export interface Requirement {
  description: string;
  dimension: RequirementDimension;
  mandatory: boolean;
  source: string;
  classification: RequirementClassification;
  evidence: string | null;
  explanation: string;
}

export interface DimensionScore {
  dimension: RequirementDimension;
  label: string;
  weight: number;
  score: number;
}

export interface ScoredRequirement extends Requirement {
  contribution: number;
}

export interface ScoringResult {
  score: number;
  provisional: boolean;
  dimensions: DimensionScore[];
  requirements: ScoredRequirement[];
}
