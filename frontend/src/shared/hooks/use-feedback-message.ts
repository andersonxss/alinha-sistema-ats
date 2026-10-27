import { useCallback, useId, useState } from "react";
import { notifications } from "../lib/notifications";

// Keep contextual feedback while sending the same message to the global toaster.
export function useFeedbackMessage(kind: "success" | "error") {
  const [message, setMessage] = useState("");
  const id = useId();
  const update = useCallback(
    (value: string) => {
      setMessage(value);
      if (value) notifications[kind](value, id);
      else notifications.dismiss(id);
    },
    [id, kind],
  );
  return [message, update] as const;
}
