"use client";
import type { RunAction } from "@/shared/model/action";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { VersionsService } from "../application/ports";
import { useVersionEditor } from "../hooks/use-version-editor";
import type { Version } from "../model/types";
export function VersionEditor({
  version,
  service,
  busy,
  run,
  onSaved,
}: {
  version: Version;
  service: Pick<VersionsService, "approve">;
  busy: boolean;
  run: RunAction;
  onSaved: () => unknown;
}) {
  const {
    text,
    approved,
    error,
    setApproved,
    original,
    proposed,
    acceptProposal,
    keepOriginal,
    changeText,
    save,
  } = useVersionEditor(version, service, run, onSaved);
  return (
    <div>
      <p>{version.suggestions[0]?.justification}</p>
      {error && (
        <Alert role="alert" variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="two-columns comparison">
        <div>
          <h4>Original</h4>
          {original.map((block, index) => (
            <p className="preserve" key={index}>
              {block}
            </p>
          ))}
        </div>
        <div>
          <h4>Proposta · blocos movidos destacados</h4>
          {proposed.map((block, index) => (
            <p
              className={
                original[index] === block ? "preserve" : "preserve moved"
              }
              key={index}
            >
              {original[index] !== block && (
                <small>
                  ↕ Bloco reposicionado
                  <br />
                </small>
              )}
              {block}
            </p>
          ))}
        </div>
      </div>
      <div className="actions">
        <Button variant="outline" type="button" onClick={acceptProposal}>
          Aceitar reorganização
        </Button>
        <Button variant="outline" type="button" onClick={keepOriginal}>
          Manter original
        </Button>
      </div>
      <Label className="field-label flex-col items-stretch leading-normal">
        Conteúdo final · edite livremente
        <Textarea
          rows={18}
          value={text}
          maxLength={60000}
          onChange={(event) => changeText(event.target.value)}
        />
      </Label>
      <details>
        <summary>Prévia do texto aprovado</summary>
        <article className="document-preview preserve">{text}</article>
      </details>
      <Label className="field-label checkbox flex-row items-start leading-relaxed font-normal">
        <Checkbox
          className="mt-1"
          checked={approved}
          onCheckedChange={(checked) => setApproved(checked === true)}
        />
        Revisei o conteúdo e confirmo que as informações são verdadeiras.
      </Label>
      <Button
        variant="default"
        type="button"
        disabled={busy || !approved || text.length < 150}
        onClick={() => void save()}
      >
        Aprovar e gerar PDF + DOCX
      </Button>
    </div>
  );
}
