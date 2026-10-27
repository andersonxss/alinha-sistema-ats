import { readability } from "@/domain/resumes/readability";
import { scoreRequirements } from "@/domain/scoring/score-requirements";
import type { Prisma, Task } from "@/generated/prisma/client";
import { adapt, analyze } from "@/infrastructure/ai/client";
import { db } from "@/infrastructure/database/db";
import { exportDocuments } from "@/infrastructure/export/documents";
import { removeFile, saveFile } from "@/infrastructure/storage/files";

export async function processTask(task: Task): Promise<void> {
  const files: string[] = [];
  const heartbeat = setInterval(() => {
    void db.task
      .updateMany({
        where: { id: task.id, lockToken: task.lockToken, status: "processing" },
        data: { lockedAt: new Date() },
      })
      .catch(() => {});
  }, 30000);
  try {
    const setStage = async (stage: string) => {
      await db.task.updateMany({
        where: { id: task.id, lockToken: task.lockToken, status: "processing" },
        data: { stage },
      });
    };
    await setStage("preparing");
    let result: unknown;
    let proposal: { proposedText: string; justification: string } | undefined;
    const analysis = task.analysisId
      ? await db.analysis.findUnique({
          where: { id: task.analysisId },
          include: { user: true },
        })
      : null;
    if (task.kind === "analyze") {
      if (!analysis) throw new Error("Análise excluída.");
      await db.analysis.update({
        where: { id: analysis.id },
        data: { status: "processing" },
      });
      await setStage("analyzing");
      const ai = await analyze(
        analysis.resumeSnapshot,
        analysis.vacancySnapshot,
        analysis.user.name,
      );
      await setStage("scoring");
      result = {
        ...ai,
        ...scoreRequirements(ai.requirements),
        readability: readability(analysis.resumeSnapshot),
      };
    }
    if (task.kind === "adapt") {
      if (!analysis) throw new Error("Análise excluída.");
      proposal = await adapt(
        analysis.resumeSnapshot,
        analysis.vacancySnapshot,
        analysis.user.name,
      );
    }
    if (task.kind === "export") {
      const payload = task.payload as { text: string; revision: number };
      if (!payload?.text) throw new Error("Versão não aprovada.");
      const documents = await exportDocuments(payload.text);
      files.push(await saveFile(documents.pdf, "pdf"));
      files.push(await saveFile(documents.docx, "docx"));
    }
    await db.$transaction(async (tx) => {
      // Lock and fence the completion: a stale worker cannot commit another worker's task.
      const owned = await tx.$queryRaw<
        { id: string }[]
      >`SELECT id FROM "Task" WHERE id=${task.id} AND "lockToken"=${task.lockToken} AND status='processing' FOR UPDATE`;
      if (!owned.length)
        throw new Error("Tarefa cancelada ou retomada por outro worker.");
      if (task.kind === "analyze" && analysis) {
        const scored = result as ReturnType<typeof scoreRequirements>;
        await tx.analysis.update({
          where: { id: analysis.id },
          data: {
            status: "completed",
            score: scored.score,
            result: result as Prisma.InputJsonValue,
            error: null,
          },
        });
        await tx.requirement.deleteMany({ where: { analysisId: analysis.id } });
        for (const r of scored.requirements)
          await tx.requirement.create({
            data: {
              analysisId: analysis.id,
              description: r.description,
              dimension: r.dimension,
              mandatory: r.mandatory,
              source: r.source,
              evaluation: {
                create: {
                  classification: r.classification,
                  evidence: r.evidence,
                  explanation: r.explanation,
                  contribution: r.contribution,
                },
              },
            },
          });
      }
      if (task.kind === "adapt" && analysis && proposal)
        await tx.resumeVersion.create({
          data: {
            resumeId: analysis.resumeId,
            analysisId: analysis.id,
            originalText: analysis.resumeSnapshot,
            proposedText: proposal.proposedText,
            suggestions: {
              create: {
                original: analysis.resumeSnapshot,
                replacement: proposal.proposedText,
                justification: proposal.justification,
              },
            },
          },
        });
      if (task.kind === "export" && task.versionId) {
        const payload = task.payload as { revision: number };
        for (const [i, format] of ["pdf", "docx"].entries())
          await tx.export.create({
            data: {
              versionId: task.versionId,
              format,
              fileKey: files[i],
              revision: payload.revision,
            },
          });
      }
      await tx.task.update({
        where: { id: task.id },
        data: {
          status: "completed",
          stage: "completed",
          error: null,
          lockToken: null,
        },
      });
    });
  } catch (e) {
    for (const file of files) await removeFile(file).catch(() => {});
    const message =
      e instanceof Error ? e.message.slice(0, 300) : "Falha no processamento.";
    await db.$transaction(async (tx) => {
      const updated = await tx.task.updateMany({
        where: { id: task.id, lockToken: task.lockToken, status: "processing" },
        data: {
          status: task.attempts < 3 ? "pending" : "failed",
          stage: task.attempts < 3 ? "queued" : "failed",
          availableAt: new Date(Date.now() + task.attempts * 15000),
          error: message,
          lockToken: null,
        },
      });
      if (updated.count && task.analysisId && task.kind === "analyze")
        await tx.analysis.updateMany({
          where: { id: task.analysisId },
          data: {
            status: task.attempts < 3 ? "pending" : "failed",
            error: message,
          },
        });
    });
    console.error(
      JSON.stringify({ event: "task_failed", id: task.id, kind: task.kind }),
    );
  } finally {
    clearInterval(heartbeat);
  }
}
