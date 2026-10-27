import { notifications } from "@/shared/lib/notifications";
import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import type { Resume } from "@/features/resumes/model/types";
import type { RunAction } from "@/shared/model/action";
import { useState } from "react";
import type { AnalysisService } from "../application/ports";
import type { VacancyService } from "../application/vacancy-port";
import { newAnalysisSchema, vacancyUrlSchema } from "../model/schemas";
export function useNewAnalysis(
  service: Pick<AnalysisService, "create">,
  vacancies: VacancyService,
  resumeState: { resume: Resume | null; saved: boolean },
  run: RunAction,
  refresh: () => Promise<void>,
  onCreated: (id: string) => unknown,
) {
  const [mode, setMode] = useState("text");
  const [url, setUrl] = useState("");
  const [vacancy, setVacancy] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useFeedbackMessage("error");
  const { resume, saved } = resumeState;
  const canCreate =
    saved &&
    !!resume &&
    newAnalysisSchema.safeParse({
      title,
      company,
      vacancy,
      consent,
      url: mode === "url" ? url : undefined,
    }).success;
  return {
    mode,
    setMode,
    url,
    setUrl,
    vacancy,
    setVacancy,
    title,
    setTitle,
    company,
    setCompany,
    consent,
    error,
    setConsent,
    canCreate,
    importVacancy: () => {
      const parsed = vacancyUrlSchema.safeParse({ url });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Informe uma URL válida.");
        return;
      }
      setError("");
      return run(async () => {
        const result = await vacancies.importUrl(parsed.data.url);
        setVacancy(result.text);
        notifications.success(
          "Vaga importada. Confira o texto antes de analisar.",
        );
      });
    },
    create: () =>
      run(async () => {
        if (!resume || !saved) {
          setError("Salve a revisão de um currículo antes de criar a análise.");
          return;
        }
        const parsed = newAnalysisSchema.safeParse({
          title,
          company,
          vacancy,
          consent,
          url: mode === "url" ? url : undefined,
        });
        if (!parsed.success) {
          setError(
            parsed.error.issues[0]?.message ?? "Confira os dados da vaga.",
          );
          return;
        }
        setError("");
        const result = await service.create({
          resumeId: resume.id,
          text: parsed.data.vacancy,
          title: parsed.data.title,
          company: parsed.data.company,
          ...(parsed.data.url ? { url: parsed.data.url } : {}),
          consent: parsed.data.consent,
        });
        notifications.success("Análise solicitada. Acompanhe o processamento.");
        await refresh();
        onCreated(result.id);
      }),
  };
}
