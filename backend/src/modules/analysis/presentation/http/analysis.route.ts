import {
  AnalysisNotFoundError,
  CompletedAnalysisNotFoundError,
} from "@/domain/errors/analysis-errors";
import type { HttpResourceContext } from "@/domain/repositories/http-handler.contract";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import { getAiConfig } from "@/infrastructure/ai/config";
import type { AnalysisService } from "@/modules/analysis/application/analysis.service";
import { handle, jsonBody, limited } from "@/presentation/http/http";
import { createAnalysisSchema } from "./schemas/analysis.schema";

export function createHandlers(
  service: AnalysisService,
  requireUser: RequireUser,
) {
  async function CREATE(request: Request) {
    const user = await requireUser(request);
    await limited(user.id, "analysis", 5);
    const { model } = getAiConfig();
    const data = createAnalysisSchema.parse(await jsonBody(request));
    const analysis = await service.create({
      userId: user.id,
      resumeId: data.resumeId,
      vacancyText: data.text,
      title: data.title,
      company: data.company,
      sourceUrl: data.url,
      model,
    });
    return Response.json(
      { id: analysis.id },
      {
        status: 201,
        headers: {
          Location: `/api/analyses/${encodeURIComponent(analysis.id)}`,
        },
      },
    );
  }

  async function GET(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      const row = await service.get(user.id, id);
      if (!row) throw new AnalysisNotFoundError();
      return Response.json(row);
    });
  }

  async function POST(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      await limited(user.id, "adapt", 3);
      getAiConfig();
      const { id } = await ctx.params;
      if (!(await service.queueAdaptation(user.id, id)))
        throw new CompletedAnalysisNotFoundError();
      return Response.json({ ok: true }, { status: 202 });
    });
  }

  async function DELETE(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      if (!(await service.delete(user.id, id)))
        throw new AnalysisNotFoundError();
      return Response.json({ ok: true });
    });
  }
  return { CREATE, GET, POST, DELETE };
}
