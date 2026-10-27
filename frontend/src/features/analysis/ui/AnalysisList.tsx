"use client";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { statusLabels, statusVariant } from "../model/labels";
import type { Analysis } from "../model/types";
export function AnalysisList({
  rows,
  onOpen,
}: {
  rows: Analysis[];
  onOpen: (id: string) => unknown;
}) {
  if (!rows.length)
    return (
      <div className="empty">
        <span className="empty-icon">◎</span>
        <h3>Seu próximo passo ainda está por aqui</h3>
        <p>
          Envie seu currículo e escolha uma vaga para começar sua primeira
          análise.
        </p>
        <span className="muted">Os resultados aparecerão neste espaço.</span>
      </div>
    );
  return (
    <div className="analysis-list">
      {rows.map((analysis) => (
        <Button
          variant="ghost"
          type="button"
          className="analysis-row flex h-auto w-full whitespace-normal text-left max-[760px]:grid"
          key={analysis.id}
          onClick={() => onOpen(analysis.id)}
        >
          <span className="company-icon">
            {analysis.vacancy.company[0].toUpperCase()}
          </span>
          <div className="row-title">
            <strong>{analysis.vacancy.title}</strong>
            <span>
              {analysis.vacancy.company} ·{" "}
              {new Date(analysis.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <Badge
            className="status-badge"
            variant={statusVariant(analysis.status)}
          >
            {statusLabels[analysis.status] ?? "Em análise"}
          </Badge>
          <strong className="row-score">
            {analysis.score !== null ? `${analysis.score} / 100` : "—"}
          </strong>
          <Icon type="arrow" />
        </Button>
      ))}
    </div>
  );
}
