import { z } from "zod";
import {
  requirementClassifications,
  requirementDimensions,
} from "@/domain/repositories/scoring.contract";

export const requirementSchema = z
  .object({
    description: z.string().min(3).max(1000),
    dimension: z.enum(requirementDimensions),
    mandatory: z.boolean(),
    source: z.string().min(3).max(2000),
    classification: z.enum(requirementClassifications),
    evidence: z.string().max(3000).nullable(),
    explanation: z.string().min(3).max(2000),
  })
  .strict();

export const analysisSchema = z
  .object({
    summary: z.string().min(10).max(3000),
    requirements: z.array(requirementSchema).min(1).max(60),
    recommendations: z.array(z.string().max(1000)).max(15),
    questions: z.array(z.string().max(1000)).max(15),
  })
  .strict();

export const adaptationSchema = z
  .object({
    order: z.array(z.number().int().min(0)).max(100),
    justification: z.string().min(10).max(2000),
  })
  .strict();
