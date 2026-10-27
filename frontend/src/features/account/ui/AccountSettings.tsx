"use client";
import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";

import { deleteAccountSchema } from "../model/schemas";

export function AccountSettings({
  email,
  busy,
  onDelete,
}: {
  email: string;
  busy: boolean;
  onDelete: (confirmation: string) => unknown;
}) {
  const [validationError, setValidationError] = useFeedbackMessage("error");
  return (
    <section className="panel">
      <div className="eyebrow">MINHA CONTA</div>
      <h1>Configurações</h1>
      <p>{email}</p>
      <h2>Seus dados, suas escolhas</h2>
      <p>
        Seus arquivos ficam no armazenamento local deste sistema. Ao analisar
        uma vaga, o conteúdo profissional é enviado ao fornecedor de IA
        configurado. E-mail, telefone e dados pessoais identificáveis são
        removidos por filtros automáticos; revise o texto para evitar
        compartilhar dados sensíveis.
      </p>
      <h3>Excluir minha conta</h3>
      <p>
        A exclusão remove currículos, análises, sessões e versões. Os arquivos
        serão eliminados pelo processamento em segundo plano.
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const parsed = deleteAccountSchema.safeParse({
            confirmation: String(data.get("confirmation") ?? ""),
          });
          if (!parsed.success) {
            setValidationError(
              parsed.error.issues[0]?.message ?? "Informe um e-mail válido.",
            );
            return;
          }
          setValidationError("");
          void onDelete(parsed.data.confirmation);
        }}
      >
        {validationError && (
          <Alert variant="destructive">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        <Label className="field-label flex-col items-stretch leading-normal">
          Digite seu e-mail para confirmar
          <Input name="confirmation" type="email" required autoComplete="off" />
        </Label>
        <Button variant="destructive" type="submit" disabled={busy}>
          Excluir conta e todos os dados
        </Button>
      </form>
    </section>
  );
}
