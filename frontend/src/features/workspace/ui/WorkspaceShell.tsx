"use client";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { ReactNode } from "react";
import type { WorkspaceScreen } from "../model/navigation";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
export function WorkspaceShell({
  user,
  screen,
  onNavigate,
  onSettings,
  onSignOut,
  children,
}: {
  user: { name: string };
  screen: WorkspaceScreen;
  onNavigate: (screen: WorkspaceScreen) => void;
  onSettings: () => void;
  onSignOut: () => unknown;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Alinha, início">
          <span className="brand-mark">
            a<span>↗</span>
          </span>
          alinha<span className="brand-dot">.</span>
        </a>
        <span className="workspace-label">SEU ESPAÇO DE CARREIRA</span>
        <WorkspaceNavigation screen={screen} onNavigate={onNavigate} />
        <div className="sidebar-tip">
          <Icon type="spark" />
          <strong>
            Experiência de verdade.
            <br />
            Mais bem apresentada.
          </strong>
          <p>Entenda o que a vaga pede e valorize o que você já construiu.</p>
        </div>
        <Button
          variant="ghost"
          type="button"
          className={
            screen === "settings"
              ? "nav active h-auto justify-start bg-secondary text-primary"
              : "nav h-auto justify-start"
          }
          onClick={() => onSettings()}
        >
          <Icon type="settings" />
          Configurações
        </Button>
        <div className="profile">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Minha conta</small>
          </div>
          <Button
            variant="ghost"
            type="button"
            className="logout h-11 w-11 p-0"
            title="Sair"
            aria-label="Sair"
            onClick={() => void onSignOut()}
          >
            ↪
          </Button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <span>Seu próximo passo começa com clareza.</span>
          <span className="private">
            <span /> Espaço pessoal e privado
          </span>
          <Button
            variant="ghost"
            type="button"
            className="mobile-account hidden max-[760px]:inline-flex"
            onClick={() => onSettings()}
          >
            Minha conta
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="mobile-account hidden max-[760px]:inline-flex"
            onClick={() => void onSignOut()}
          >
            Sair
          </Button>
        </header>
        <main className="content" id="main">
          {children}
        </main>
        <footer>
          alinha<span> Uma carreira feita de possibilidades.</span>
          <small>Feito para quem quer dar o próximo passo.</small>
        </footer>
      </div>
    </div>
  );
}
