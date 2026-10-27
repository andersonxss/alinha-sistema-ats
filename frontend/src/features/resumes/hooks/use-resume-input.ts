import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import type { RunAction } from "@/shared/model/action";
import { useState } from "react";
import type { ResumesService } from "../application/ports";
import type { Resume } from "../model/types";
import { resumeReviewSchema, resumeUploadSchema } from "../model/schemas";
export function useResumeInput(
  service: ResumesService,
  run: RunAction,
  refresh: () => Promise<void>,
  notify: (message: string) => void,
) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useFeedbackMessage("error");
  function select(resume: Resume) {
    setResume(resume);
    setText(resume.reviewedText);
    setName(resume.name);
    setSaved(false);
  }
  return {
    resume,
    text,
    name,
    saved,
    error,
    changeName: (value: string) => {
      setName(value);
      setSaved(false);
      setError("");
    },
    changeText: (value: string) => {
      setText(value);
      setSaved(false);
      setError("");
    },
    selectResume: (id: string) =>
      run(async () => select(await service.get(id))),
    upload: (file: File) => {
      const parsed = resumeUploadSchema.safeParse(file);
      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ?? "Confira o arquivo selecionado.",
        );
        return;
      }
      setError("");
      return run(async () => {
        select(await service.upload(file));
        notify("Currículo enviado. Revise o texto extraído.");
        await refresh();
      });
    },
    save: () =>
      run(async () => {
        if (!resume) return;
        const parsed = resumeReviewSchema.safeParse({ text, name });
        if (!parsed.success) {
          setError(
            parsed.error.issues[0]?.message ?? "Confira os dados do currículo.",
          );
          return;
        }
        setError("");
        await service.update(resume.id, parsed.data);
        setSaved(true);
        notify("Currículo revisado e salvo.");
        await refresh();
      }),
    remove: () =>
      run(async () => {
        if (!resume) return;
        await service.remove(resume.id);
        notify("Currículo excluído.");
        setResume(null);
        await refresh();
      }),
    originalUrl: resume ? service.fileUrl(resume.id) : "",
  };
}
export type ResumeInputState = ReturnType<typeof useResumeInput>;
