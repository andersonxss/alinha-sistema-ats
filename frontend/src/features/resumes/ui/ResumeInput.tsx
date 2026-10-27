"use client";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { Textarea } from "@/shared/ui/textarea";
import type { ResumeInputState } from "../hooks/use-resume-input";
import type { Resume } from "../model/types";
export function ResumeInput({
  resumes,
  busy,
  state,
}: {
  resumes: Resume[];
  busy: boolean;
  state: ResumeInputState;
}) {
  const {
    resume,
    text,
    name,
    saved,
    changeName,
    changeText,
    selectResume,
    upload,
    save,
    remove,
    originalUrl,
  } = state;
  return (
    <section className="panel">
      <h2>
        <span className="step">1</span> Seu currículo
      </h2>
      {state.error && (
        <Alert role="alert" variant="destructive" className="mb-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="two-columns">
        <Label className="field-label flex-col items-stretch leading-normal">
          Escolher um currículo
          <NativeSelect
            value={resume?.id ?? ""}
            onChange={(event) => void selectResume(event.target.value)}
          >
            <NativeSelectOption value="" disabled>
              Selecione um currículo
            </NativeSelectOption>
            {resumes.map((resumeOption) => (
              <NativeSelectOption key={resumeOption.id} value={resumeOption.id}>
                {resumeOption.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Label className="field-label upload flex-col items-stretch leading-normal">
          Ou envie um novo arquivo{" "}
          <Input
            type="file"
            accept=".pdf,.docx"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <small>PDF com texto ou DOCX · até 10 MB</small>
        </Label>
      </div>
      {resume && (
        <div className="resume-review">
          {resume.extractionWarning && (
            <Alert role="alert" variant="warning" className="mb-5">
              <AlertDescription>{resume.extractionWarning}</AlertDescription>
            </Alert>
          )}
          <Label className="field-label flex-col items-stretch leading-normal">
            Nome do currículo
            <Input
              value={name}
              onChange={(event) => changeName(event.target.value)}
              maxLength={180}
            />
          </Label>
          <Label className="field-label flex-col items-stretch leading-normal">
            Confira e corrija o texto extraído
            <Textarea
              value={text}
              onChange={(event) => changeText(event.target.value)}
              rows={15}
            />
          </Label>
          <p className="hint">
            Separe seções por uma linha em branco. Mantenha cargo, empresa,
            datas e atividades de cada experiência no mesmo bloco. Não inclua
            documentos pessoais ou informações sensíveis.
          </p>
          <details>
            <summary>Seções identificadas no último salvamento</summary>
            {Object.entries(resume.sections ?? {})
              .filter(([, sectionText]) => sectionText.trim())
              .map(([sectionName, sectionText]) => (
                <div key={sectionName}>
                  <h4>{sectionName}</h4>
                  <p className="preserve">{sectionText}</p>
                </div>
              ))}
          </details>
          <div className="actions">
            <Button variant="outline" asChild>
              <a className="no-underline" href={originalUrl}>
                ↓ Original
              </a>
            </Button>
            <Button
              variant="default"
              type="button"
              disabled={busy || text.length < 150}
              onClick={() => void save()}
            >
              {saved ? "✓ Currículo revisado" : "Salvar revisão"}
            </Button>
            <ConfirmAction
              title="Excluir currículo?"
              description="O currículo e todas as análises e versões vinculadas serão excluídos. Esta ação não pode ser desfeita."
              confirmLabel="Excluir currículo"
              disabled={busy}
              onConfirm={() => void remove()}
            >
              <Button variant="destructive" disabled={busy}>
                Excluir currículo
              </Button>
            </ConfirmAction>
          </div>
        </div>
      )}
    </section>
  );
}
