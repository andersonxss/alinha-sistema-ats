import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface CredentialsFormProps {
  signup: boolean;
  busy: boolean;
  onSubmit: (form: FormData) => Promise<void>;
}

export function CredentialsForm({
  signup,
  busy,
  onSubmit,
}: CredentialsFormProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      {signup && (
        <Label className="field-label flex-col items-stretch leading-normal">
          Seu nome
          <Input
            name="name"
            maxLength={100}
            autoComplete="name"
            placeholder="Como podemos chamar você?"
          />
        </Label>
      )}
      <Label className="field-label flex-col items-stretch leading-normal">
        E-mail
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
      </Label>
      <Label className="field-label flex-col items-stretch leading-normal">
        Senha
        <Input
          name="password"
          type="password"
          required
          minLength={signup ? 12 : 1}
          maxLength={128}
          autoComplete={signup ? "new-password" : "current-password"}
          placeholder={signup ? "Pelo menos 12 caracteres" : "Sua senha"}
        />
      </Label>
      <Button variant="default" type="submit" className="full" disabled={busy}>
        {busy
          ? "Aguarde…"
          : signup
            ? "Criar minha conta"
            : "Entrar no meu espaço"}
        <span>→</span>
      </Button>
    </form>
  );
}
