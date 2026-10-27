import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { CredentialsForm } from "./CredentialsForm";

interface AccessPanelProps {
  signup: boolean;
  error: string;
  busy: boolean;
  onSubmit: (form: FormData) => Promise<void>;
  onToggleMode: () => void;
}

export function AccessPanel({
  signup,
  error,
  busy,
  onSubmit,
  onToggleMode,
}: AccessPanelProps) {
  
  return (
    <section className="access-form">
      <span className="eyebrow">BEM-VINDO AO SEU ESPAÇO</span>
      <h2>{signup ? "Crie sua conta" : "Bom ter você por aqui."}</h2>
      <p>
        {signup
          ? "Organize sua próxima oportunidade."
          : "Entre para continuar sua jornada."}
      </p>
      {error && (
        <Alert variant="destructive" className="mb-5" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <CredentialsForm signup={signup} busy={busy} onSubmit={onSubmit} />
      <p className="switch-auth">
        {signup ? "Já tem uma conta?" : "Primeira vez por aqui?"}{" "}
        <Button variant="ghost" type="button" onClick={onToggleMode}>
          {signup ? "Entrar" : "Criar conta"}
        </Button>
      </p>
      <small className="muted">
        Seus currículos são privados e acessíveis apenas na sua conta.
      </small>
    </section>
  );
}
