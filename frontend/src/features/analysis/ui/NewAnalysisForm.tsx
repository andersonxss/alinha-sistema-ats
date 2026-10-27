"use client";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Alert, AlertDescription } from "@/shared/ui/alert";

import type { ResumesService } from "@/features/resumes/application/ports";
import { useResumeInput } from "@/features/resumes/hooks/use-resume-input";
import type { Resume } from "@/features/resumes/model/types";
import { ResumeInput } from "@/features/resumes/ui/ResumeInput";
import { ResumeLibrary } from "@/features/resumes/ui/ResumeLibrary";
import type { RunAction } from "@/shared/model/action";
import type { AnalysisService } from "../application/ports";
import type { VacancyService } from "../application/vacancy-port";
import { useNewAnalysis } from "../hooks/use-new-analysis";
export function NewAnalysisForm({
  resumes,
  onlyResume,
  busy,
  run,
  refresh,
  onCreated,
  notify,
  resumeService,
  analysisService,
  vacancyService,
}: {
  resumes: Resume[];
  onlyResume: boolean;
  busy: boolean;
  run: RunAction;
  refresh: () => Promise<void>;
  onCreated: (id: string) => unknown;
  notify: (message: string) => void;
  resumeService: ResumesService;
  analysisService: Pick<AnalysisService, "create">;
  vacancyService: VacancyService;
}) {
  const resumeState = useResumeInput(resumeService, run, refresh, notify);
  const { saved } = resumeState;
  const {
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
    importVacancy,
    create,
  } = useNewAnalysis(
    analysisService,
    vacancyService,
    resumeState,
    run,
    refresh,
    onCreated,
  );
  return (
    <>
      <ResumeLibrary onlyResume={onlyResume}>
        <ResumeInput resumes={resumes} busy={busy} state={resumeState} />
      </ResumeLibrary>
      {!onlyResume && (
        <section className="panel">
          <h2>
            <span className="step">2</span> A oportunidade
          </h2>
          {error && (
            <Alert role="alert" variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="tabs" role="group" aria-label="Entrada da vaga">
            <Button
              variant="ghost"
              type="button"
              aria-pressed={mode === "text"}
              className={
                mode === "text" ? "selected bg-white text-primary" : ""
              }
              onClick={() => setMode("text")}
            >
              Colar descrição
            </Button>
            <Button
              variant="ghost"
              type="button"
              aria-pressed={mode === "url"}
              className={mode === "url" ? "selected bg-white text-primary" : ""}
              onClick={() => setMode("url")}
            >
              Informar link
            </Button>
          </div>
          {mode === "url" && (
            <div className="url-input">
              <Label className="field-label flex-col items-stretch leading-normal">
                Link público da vaga
                <Input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://empresa.com/vaga"
                />
              </Label>
              <Button
                variant="outline"
                type="button"
                disabled={busy || !url}
                onClick={() => void importVacancy()}
              >
                Importar descrição
              </Button>
            </div>
          )}
          <div className="two-columns">
            <Label className="field-label flex-col items-stretch leading-normal">
              Cargo
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                placeholder="Ex.: Analista de operações"
              />
            </Label>
            <Label className="field-label flex-col items-stretch leading-normal">
              Empresa
              <Input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                maxLength={160}
                placeholder="Nome da empresa"
              />
            </Label>
          </div>
          <Label className="field-label flex-col items-stretch leading-normal">
            Descrição da vaga · revise antes de continuar
            <Textarea
              rows={10}
              value={vacancy}
              onChange={(event) => setVacancy(event.target.value)}
              maxLength={30000}
              placeholder="Cole responsabilidades, requisitos obrigatórios e desejáveis…"
            />
          </Label>
          <Label className="field-label checkbox flex-row items-start leading-relaxed font-normal">
            <Checkbox
              className="mt-1"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
            />
            Revisei os textos e autorizo o processamento do conteúdo
            profissional pelo fornecedor externo de IA configurado.
          </Label>
          <Button
            variant="default"
            type="button"
            disabled={busy || !canCreate}
            onClick={() => void create()}
          >
            {busy ? "Processando…" : "Analisar compatibilidade →"}
          </Button>
          {!saved && (
            <p className="hint">
              Salve a revisão do currículo para liberar a análise.
            </p>
          )}
        </section>
      )}
    </>
  );
}
