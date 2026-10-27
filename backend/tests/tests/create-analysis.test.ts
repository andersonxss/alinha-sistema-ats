import assert from "node:assert/strict";
import test from "node:test";
import {
  ResumeNeedsReviewError,
  ResumeNotFoundError,
} from "@/domain/errors/resume-errors";
import type {
  CreateAnalysisInput,
  IAnalysisRepository,
} from "@/domain/repositories/analysis.repository";
import { AnalysisService } from "@/modules/analysis/application/analysis.service";

const input: CreateAnalysisInput = {
  userId: "user-a",
  resumeId: "resume-a",
  vacancyText:
    "Vaga revisada com mais de cem caracteres para garantir os dados de entrada necessários ao fluxo de análise.",
  title: "Analista",
  company: "Empresa",
  model: "controlled-model",
};

function repository(
  resume: Awaited<ReturnType<IAnalysisRepository["findReviewedResume"]>>,
) {
  let persisted: (CreateAnalysisInput & { resumeSnapshot: string }) | undefined;
  const adapter: IAnalysisRepository = {
    async findOwnedAnalysis() {
      throw new Error("Unexpected resource query in creation");
    },
    async queueAdaptation() {
      throw new Error("Unexpected adaptation in creation");
    },
    async deleteOwnedAnalysis() {
      throw new Error("Unexpected deletion in creation");
    },
    async findReviewedResume(userId, resumeId) {
      assert.equal(userId, input.userId);
      assert.equal(resumeId, input.resumeId);
      return resume;
    },
    async createWithVacancy(value) {
      persisted = value;
      return { id: "analysis-a" };
    },
  };
  return { adapter, persisted: () => persisted };
}

test("cria análise com snapshot revisado e dados da vaga", async () => {
  const resume = {
    id: input.resumeId,
    reviewedText: "Texto profissional revisado".repeat(8),
    extractionWarning: null,
  };
  const repo = repository(resume);
  const result = await new AnalysisService(repo.adapter).create(input);

  assert.equal(result.id, "analysis-a");
  assert.equal(repo.persisted()?.resumeSnapshot, resume.reviewedText);
  assert.equal(repo.persisted()?.vacancyText, input.vacancyText);
  assert.equal(repo.persisted()?.userId, input.userId);
});

test("recusa currículo de outro usuário ou inexistente sem persistir", async () => {
  const repo = repository(null);
  await assert.rejects(
    new AnalysisService(repo.adapter).create(input),
    ResumeNotFoundError,
  );
  assert.equal(repo.persisted(), undefined);
});

test("exige revisão completa antes de criar a tarefa", async () => {
  const repo = repository({
    id: input.resumeId,
    reviewedText: "Texto curto",
    extractionWarning: null,
  });
  await assert.rejects(
    new AnalysisService(repo.adapter).create(input),
    ResumeNeedsReviewError,
  );
  assert.equal(repo.persisted(), undefined);
});
