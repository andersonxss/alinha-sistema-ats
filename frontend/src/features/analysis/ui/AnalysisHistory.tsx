"use client";
import { Button } from "@/shared/ui/button";
import type { Analysis } from "../model/types";
import { AnalysisList } from "./AnalysisList";
export function AnalysisHistory({
  analyses,
  onNewAnalysis,
  openAnalysis,
}: {
  analyses: Analysis[];
  onNewAnalysis: () => void;
  openAnalysis: (id: string) => unknown;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SUA TRAJETÓRIA</div>
          <h1>Histórico de análises</h1>
          <p>Retome suas análises e versões adaptadas.</p>
        </div>
        <Button variant="default" type="button" onClick={() => onNewAnalysis()}>
          + Nova análise
        </Button>
      </div>
      <AnalysisList rows={analyses} onOpen={openAnalysis} />
    </>
  );
}
