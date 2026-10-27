import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import { useState } from "react";
import type { RunAction } from "../model/action";
import { errorMessage } from "../lib/error-message";
export function useActionFeedback() {
  const [error, setError] = useFeedbackMessage("error");
  const [notice, setNotice] = useFeedbackMessage("success");
  const [busy, setBusy] = useState(false);
  const run: RunAction = async (action) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return { error, setError, notice, setNotice, busy, run };
}
