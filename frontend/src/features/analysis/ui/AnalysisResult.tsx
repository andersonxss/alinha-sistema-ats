"use client";
import type { VersionsService } from "@/features/versions/application/ports";
import { VersionEditor } from "@/features/versions/ui/VersionEditor";
import type { RunAction } from "@/shared/model/action";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import type { AnalysisService } from "../application/ports";
import { useAnalysisActions } from "../hooks/use-analysis-actions";
import {
  classificationLabels,
  dimensionLabels,
  statusLabels,
  statusVariant,
} from "../model/labels";
import type { Analysis } from "../model/types";
export function AnalysisResult({
  analysis,
  service,
  versions,
  busy,
  run,
  refresh,
  onDeleted,
}: {
  analysis: Analysis;
  service: Pick<AnalysisService, "remove" | "adapt">;
  versions: VersionsService;
  busy: boolean;
  run: RunAction;
  refresh: () => unknown;
  onDeleted: () => void;
}) {
  const { editing, toggleEditor, remove, adapt } = useAnalysisActions(
    analysis.id,
    service,
    run,
    refresh,
    onDeleted,
  );
  const result = analysis.result;
  const pending = analysis.tasks?.some(
    (task) =>
      ["pending", "processing"].includes(task.status) && task.kind === "adapt",
  );
  const analysisTask = analysis.tasks?.find((task) => task.kind === "analyze");
  const failureReason = analysis.error || analysisTask?.error;
  const progressSteps = [
    { id: "preparing", label: "Preparando currículo e vaga" },
    { id: "analyzing", label: "Comparando requisitos e evidências" },
    { id: "scoring", label: "Validando evidências e calculando a estimativa" },
  ];
  const progressIndex =
    analysis.status === "completed"
      ? progressSteps.length
      : analysis.status === "processing"
        ? Math.max(
            0,
            progressSteps.findIndex((step) => step.id === analysisTask?.stage),
          )
        : -1;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SUA COMPATIBILIDADE EM DETALHES</div>
          <h1>{analysis.vacancy.title}</h1>
          <p>
            {analysis.vacancy.company} ·{" "}
            {new Date(analysis.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <ConfirmAction
          title="Excluir análise?"
          description="A análise e suas versões vinculadas serão excluídas. Esta ação não pode ser desfeita."
          confirmLabel="Excluir análise"
          disabled={busy}
          onConfirm={() => void remove()}
        >
          <Button variant="destructive" disabled={busy}>
            Excluir análise
          </Button>
        </ConfirmAction>
      </div>
      {analysis.status !== "completed" && (
        <section
          className={`panel analysis-progress ${analysis.status === "failed" ? "has-failed" : ""}`}
          aria-live={analysis.status === "failed" ? "polite" : "off"}
        >
          <div className="analysis-progress-heading">
            <div>
              <span className="eyebrow">ACOMPANHAMENTO DA ANÁLISE</span>
              <h2>{statusLabels[analysis.status] ?? "Status desconhecido"}</h2>
            </div>
            {analysis.status === "processing" && (
              <span className="progress-pulse" role="status">
                <span className="sr-only">Análise em andamento</span>
              </span>
            )}
          </div>
          {analysis.status === "failed" ? (
            <Alert variant="destructive" className="mb-5" role="alert">
              <AlertDescription>
                <strong>Não foi possível concluir a análise.</strong>
                <p>
                  {failureReason ||
                    "O processamento foi encerrado sem uma mensagem de erro. Confira os registros do worker."}
                </p>
                <small>
                  Corrija o problema indicado e inicie uma nova análise.
                </small>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <ol
                className="progress-steps"
                aria-label="Etapas do processamento"
              >
                {progressSteps.map((step, index) => {
                  const done = index < progressIndex;
                  const active =
                    index === progressIndex && analysis.status === "processing";
                  return (
                    <li
                      key={step.id}
                      className={`${done ? "done" : ""} ${active ? "active" : ""}`.trim()}
                    >
                      <span className="step-marker" aria-hidden="true">
                        {done ? "✓" : index + 1}
                      </span>
                      <span>{step.label}</span>
                      {active && (
                        <span className="step-current">Em andamento</span>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="progress-caption">
                {analysis.status === "pending"
                  ? "Sua solicitação está na fila. O processamento começa automaticamente."
                  : "A análise continua mesmo se você fechar esta página; o status é atualizado automaticamente."}
              </p>
              {analysis.status === "pending" && failureReason && (
                <Alert variant="warning" className="mb-5">
                  <AlertDescription>
                    <strong>Uma tentativa não funcionou.</strong>
                    <p>{failureReason}</p>
                    {analysisTask?.attempts ? (
                      <small>
                        Nova tentativa automática (
                        {Math.min(analysisTask.attempts, 2)} de 2) em{" "}
                        {new Date(analysisTask.availableAt).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                        .
                      </small>
                    ) : null}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </section>
      )}
      {result && (
        <>
          <section className="panel result-summary">
            <div className="score-circle">
              <strong>{analysis.score}</strong>
              <span>de 100</span>
            </div>
            <div>
              <span className="eyebrow">
                {result.provisional
                  ? "ESTIMATIVA PROVISÓRIA · HÁ DADOS A CONFIRMAR"
                  : "ESTIMATIVA DE COMPATIBILIDADE"}
              </span>
              <h2>Sua experiência e esta oportunidade</h2>
              <p>{result.summary}</p>
              <small>
                Estimativa interna. Não garante aprovação nem reproduz a nota de
                outros sistemas ATS.
              </small>
            </div>
          </section>
          <section className="panel">
            <h2>O que compõe sua nota</h2>
            {result.dimensions.map((dimension) => (
              <div className="dimension" key={dimension.dimension}>
                <div>
                  <span>{dimensionLabels[dimension.dimension]}</span>
                  <strong>
                    {Math.round(dimension.score)} / 100{" "}
                    <small>· peso {Math.round(dimension.weight)}%</small>
                  </strong>
                </div>
                <progress
                  max={100}
                  value={dimension.score}
                  aria-label={dimensionLabels[dimension.dimension]}
                />
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Requisitos e evidências</h2>
            <p>
              “Não evidenciado” significa que o currículo não apresenta a
              informação.
            </p>
            {result.requirements.map((requirement, index) => (
              <details
                className="requirement"
                key={index}
                open={requirement.mandatory}
              >
                <summary>
                  <span>
                    {requirement.description}{" "}
                    {requirement.mandatory && (
                      <Badge variant="outline" className="ml-1">
                        Obrigatório
                      </Badge>
                    )}
                  </span>
                  <Badge
                    className="status-badge"
                    variant={statusVariant(requirement.classification)}
                  >
                    {classificationLabels[requirement.classification]}
                  </Badge>
                </summary>
                <p>
                  <strong>Na vaga:</strong> “{requirement.source}”
                </p>
                <blockquote>
                  {requirement.evidence
                    ? `“${requirement.evidence}”`
                    : "Não foi identificada evidência no currículo."}
                </blockquote>
                <p>{requirement.explanation}</p>
                <small>
                  Contribuição: {requirement.contribution.toFixed(2)} ponto(s) ·{" "}
                  {dimensionLabels[requirement.dimension]}
                </small>
              </details>
            ))}
          </section>
          <div className="two-columns">
            <section className="panel">
              <h2>Próximos passos recomendados</h2>
              <ol>
                {result.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ol>
              {result.questions.length > 0 && (
                <>
                  <h3>Informações a confirmar</h3>
                  <ul>
                    {result.questions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                  <p className="hint">
                    Atualize o currículo com fatos confirmados e crie uma nova
                    análise para recalcular.
                  </p>
                </>
              )}
            </section>
            <section className="panel">
              <h2>Legibilidade do texto</h2>
              <p>{result.readability.words} palavras extraídas.</p>
              {result.readability.warnings.length ? (
                <ul>
                  {result.readability.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum alerta nas verificações básicas de texto.</p>
              )}
              <p className="hint">
                Avaliação separada da compatibilidade. Não inspeciona a
                aparência do documento original.
              </p>
            </section>
          </div>
          <section className="panel">
            <h2>Uma versão para esta oportunidade</h2>
            <p>
              A IA sugere uma ordem mais relevante para os blocos do currículo.
              Todos os fatos e palavras são preservados. Você revisa e pode
              editar antes de aprovar.
            </p>
            <Button
              variant="default"
              type="button"
              disabled={busy || pending}
              onClick={() => void adapt()}
            >
              {pending ? "Preparando proposta…" : "✦ Gerar versão adaptada"}
            </Button>
            {analysis.tasks
              .filter(
                (task) => task.kind === "adapt" && task.status === "failed",
              )
              .slice(0, 1)
              .map((task) => (
                <Alert variant="destructive" className="mb-5" key={task.id}>
                  <AlertDescription>{task.error}</AlertDescription>
                </Alert>
              ))}
            {analysis.versions?.map((version) => (
              <div className="version" key={version.id}>
                <div className="section-heading">
                  <h3>Versão adaptada · revisão {version.revision}</h3>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => toggleEditor(version.id)}
                  >
                    {editing === version.id
                      ? "Fechar editor"
                      : "Revisar e editar"}
                  </Button>
                </div>
                {editing === version.id && (
                  <VersionEditor
                    service={versions}
                    version={version}
                    busy={busy}
                    run={run}
                    onSaved={refresh}
                  />
                )}
                <div className="actions">
                  {version.exports.map((exportFile) => (
                    <Button variant="outline" asChild key={exportFile.id}>
                      <a
                        className="no-underline"
                        href={versions.downloadUrl(exportFile.id)}
                      >
                        ↓ {exportFile.format.toUpperCase()} · revisão{" "}
                        {exportFile.revision}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {analysis.tasks
              .filter((task) => task.kind === "export")
              .slice(0, 3)
              .map((task) => (
                <p key={task.id} role="status">
                  Exportação: {statusLabels[task.status]} {task.error ?? ""}
                </p>
              ))}
          </section>
          <p className="hint">
            Regras {analysis.rulesVersion} · Prompt {analysis.promptVersion} ·
            Modelo {analysis.model}
          </p>
        </>
      )}
    </>
  );
}
