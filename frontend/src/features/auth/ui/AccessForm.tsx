"use client";

import type { AuthService } from "../application/ports";
import { useAuthForm } from "../hooks/use-auth-form";
import { AccessBrand } from "./AccessBrand";
import { AccessPanel } from "./AccessPanel";

interface AccessFormProps {
  service: AuthService;
}

export function AccessForm({ service }: AccessFormProps) {
  const { signup, error, busy, submit, toggleMode } = useAuthForm(service);

  return (
    <main className="access">
      <AccessBrand />
      <AccessPanel
        signup={signup}
        error={error}
        busy={busy}
        onSubmit={submit}
        onToggleMode={toggleMode}
      />
    </main>
  );
}
