import { notifications } from "@/shared/lib/notifications";
import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import { useState } from "react";
import { authenticate } from "../application/authenticate";
import type { AuthService } from "../application/ports";
import { validateAuthCredentials } from "../model/auth-credentials";

export function useAuthForm(service: AuthService) {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useFeedbackMessage("error");
  const [busy, setBusy] = useState(false);

  async function submit(form: FormData) {
    setError("");
    const validation = validateAuthCredentials(signup ? "signUp" : "signIn", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      name: String(form.get("name") ?? ""),
    });

    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setBusy(true);
    try {
      const result = await authenticate(service, validation.credentials);
      if (result.error) setError(result.error);
      else
        notifications.success(
          signup ? "Conta criada com sucesso." : "Você entrou na sua conta.",
        );
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setSignup(!signup);
    setError("");
  }

  return { signup, error, busy, submit, toggleMode };
}
