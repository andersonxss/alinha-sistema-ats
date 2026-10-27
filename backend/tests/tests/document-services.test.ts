import assert from "node:assert/strict";
import test from "node:test";
import type { IResumeRepository } from "@/domain/repositories/resume.repository";
import type { IVersionRepository } from "@/domain/repositories/version.repository";
import { ResumeService } from "@/modules/documents/application/resume.service";
import { VersionService } from "@/modules/documents/application/version.service";

function resumeRepository(
  overrides: Partial<IResumeRepository> = {},
): IResumeRepository {
  return {
    async findOwned() {
      return null;
    },
    async reviewOwned() {
      return false;
    },
    async deleteOwned() {
      return false;
    },
    ...overrides,
  };
}

test("revisão persiste texto, nome e seções do mesmo conteúdo, mantendo o proprietário", async () => {
  const review = { text: "Texto revisado", name: "Currículo revisado" };
  let saved = false;
  const repository = resumeRepository({
    async reviewOwned(userId, id, data) {
      assert.equal(userId, "owner");
      assert.equal(id, "resume");
      assert.deepEqual(data, { ...review, sections: { resumo: review.text } });
      saved = true;
      return true;
    },
  });
  const service = new ResumeService(repository, (text) => ({ resumo: text }));
  assert.equal(await service.review("owner", "resume", review), true);
  assert.equal(saved, true);
});

test("falha ao preparar seções não inicia a persistência da revisão", async () => {
  let writes = 0;
  const repository = resumeRepository({
    async reviewOwned() {
      writes++;
      return true;
    },
  });
  const failure = new Error("section parser failed");
  const service = new ResumeService(repository, () => {
    throw failure;
  });
  assert.throws(
    () => service.review("owner", "resume", { text: "text", name: "name" }),
    failure,
  );
  assert.equal(writes, 0);
});

test("recurso ausente ou fora do escopo mantém resultado de ausência nas operações", async () => {
  const service = new ResumeService(resumeRepository(), () => ({}));
  assert.equal(await service.get("owner", "unavailable"), null);
  assert.equal(
    await service.review("owner", "unavailable", {
      text: "text",
      name: "name",
    }),
    false,
  );
  assert.equal(await service.delete("owner", "unavailable"), false);
});

test("consulta conserva os dados retornados e exclusão envia o escopo de proprietário", async () => {
  const record = {
    id: "resume",
    name: "CV",
    extractionWarning: null,
    createdAt: new Date(),
  };
  const repository = resumeRepository({
    async findOwned(userId, id) {
      assert.equal(userId, "owner");
      assert.equal(id, record.id);
      return record;
    },
    async deleteOwned(userId, id) {
      assert.equal(userId, "owner");
      assert.equal(id, record.id);
      return true;
    },
  });
  const service = new ResumeService(repository, () => ({}));
  assert.equal(await service.get("owner", record.id), record);
  assert.equal(await service.delete("owner", record.id), true);
});

test("aprovação encaminha a revisão esperada sem antecipar incremento ou repetir conflito", async () => {
  const review = { text: "Texto aprovado", accepted: false, revision: 7 };
  let calls = 0;
  const repository: IVersionRepository = {
    async reviewAndQueueExport(userId, id, input) {
      calls++;
      assert.equal(userId, "owner");
      assert.equal(id, "version");
      assert.deepEqual(input, review);
      return false;
    },
  };
  assert.equal(
    await new VersionService(repository).review("owner", "version", review),
    false,
  );
  assert.equal(calls, 1);
  assert.equal(review.revision, 7);
});

test("falhas de persistência são propagadas sem retries ou sucesso falso", async () => {
  const failure = new Error("transaction failed");
  const service = new VersionService({
    async reviewAndQueueExport() {
      throw failure;
    },
  });
  await assert.rejects(
    service.review("owner", "version", {
      text: "text",
      accepted: true,
      revision: 0,
    }),
    failure,
  );
});
