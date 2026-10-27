"use client";
import { AnalysisList } from "@/features/analysis/ui/AnalysisList";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { Dashboard } from "../model/types";
import { StatCard } from "./StatCard";
export function DashboardOverview({
  userName,
  dashboard,
  onNewAnalysis,
  onHistory,
  openAnalysis,
}: {
  userName: string;
  dashboard: Dashboard | null;
  onNewAnalysis: () => void;
  onHistory: () => void;
  openAnalysis: (id: string) => unknown;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">VAMOS ENCONTRAR SEU PRÓXIMO PASSO</div>
          <h1>
            Olá, {userName.split(" ")[0]} <span className="wave">✳</span>
          </h1>
          <p>Cada oportunidade merece a melhor versão da sua história.</p>
        </div>
        <Button variant="default" type="button" onClick={() => onNewAnalysis()}>
          <Icon type="plus" />
          Analisar nova vaga
        </Button>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <Badge
            variant="outline"
            className="pill border-transparent text-inherit"
          >
            <Icon type="spark" /> MAIS CLAREZA, MAIS POSSIBILIDADES
          </Badge>
          <h2>
            Sua experiência.
            <br />
            Na direção <em>certa.</em>
          </h2>
          <p>
            Descubra como seu currículo se conecta à vaga e prepare uma versão
            que valoriza suas conquistas reais.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="resume-illustration">
            <div className="art-avatar" />
            <div className="art-line long" />
            <div className="art-line short" />
            <div className="art-rule" />
            <div className="art-line title" />
            {[1, 2, 3].map((index) => (
              <div className="art-line" key={index} />
            ))}
            <div className="art-line title" />
            {[1, 2, 3].map((index) => (
              <div className="art-line" key={index} />
            ))}
            <span className="art-check">✓</span>
          </div>
          <div className="floating-label">✦ Sua história tem valor</div>
        </div>
      </section>
      <div className="stats">
        <StatCard
          label="Currículos cadastrados"
          value={dashboard?.resumes.length ?? 0}
          icon="resume"
        />
        <StatCard
          label="Oportunidades analisadas"
          value={
            dashboard?.analyses.filter(
              (analysis) => analysis.status === "completed",
            ).length ?? 0
          }
          icon="check"
        />
        <StatCard
          label="Análises em andamento"
          value={
            dashboard?.analyses.filter((analysis) =>
              ["pending", "processing"].includes(analysis.status),
            ).length ?? 0
          }
          icon="history"
        />
      </div>
      <div className="section-heading">
        <div>
          <h2>Suas últimas análises</h2>
          <p>Um novo olhar sobre cada oportunidade.</p>
        </div>
        <Button variant="ghost" type="button" onClick={() => onHistory()}>
          Ver histórico <span>→</span>
        </Button>
      </div>
      <AnalysisList
        rows={dashboard?.analyses.slice(0, 4) ?? []}
        onOpen={openAnalysis}
      />
      <div className="bottom-note">
        <span>ⓘ</span>
        <p>
          A compatibilidade é uma estimativa interna, não uma garantia de
          aprovação. Sua trajetória vai além de uma nota.
        </p>
      </div>
    </>
  );
}
