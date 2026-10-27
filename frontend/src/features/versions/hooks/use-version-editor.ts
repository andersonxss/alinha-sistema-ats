import { notifications } from "@/shared/lib/notifications";
import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import type { RunAction } from "@/shared/model/action";
import { useState } from "react";
import type { VersionsService } from "../application/ports";
import type { Version } from "../model/types";
import { versionApprovalSchema } from "../model/schemas";
export function useVersionEditor(
  version: Version,
  service: Pick<VersionsService, "approve">,
  run: RunAction,
  onSaved: () => unknown,
) {
  const [text, setText] = useState(
    version.approvedText ?? version.proposedText,
  );
  const [accepted, setAccepted] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useFeedbackMessage("error");
  return {
    text,
    approved,
    error,
    setApproved,
    original: version.originalText.split(/\n\s*\n/),
    proposed: version.proposedText.split(/\n\s*\n/),
    acceptProposal: () => {
      setText(version.proposedText);
      setError("");
      setAccepted(true);
      setApproved(false);
    },
    keepOriginal: () => {
      setText(version.originalText);
      setError("");
      setAccepted(false);
      setApproved(false);
    },
    changeText: (value: string) => {
      setText(value);
      setApproved(false);
      setError("");
    },
    save: () =>
      run(async () => {
        const parsed = versionApprovalSchema.safeParse({ text, approved });
        if (!parsed.success) {
          setError(
            parsed.error.issues[0]?.message ??
              "Confira a versão antes de aprovar.",
          );
          return;
        }
        setError("");
        await service.approve(version.id, {
          text: parsed.data.text,
          accepted,
          revision: version.revision,
        });
        notifications.success("Versão aprovada. A exportação foi solicitada.");
        onSaved();
      }),
  };
}
