"use client";
import { notifications } from "@/shared/lib/notifications";
import { frontendServices } from "@/composition/frontend-services";
import { deleteAccount } from "@/features/account/application/delete-account";
import { AccountSettings } from "@/features/account/ui/AccountSettings";
import { AnalysisHistory } from "@/features/analysis/ui/AnalysisHistory";
import { AnalysisResult } from "@/features/analysis/ui/AnalysisResult";
import { NewAnalysisForm } from "@/features/analysis/ui/NewAnalysisForm";
import { useSession } from "@/features/auth/api/auth-service";
import { AccessForm } from "@/features/auth/ui/AccessForm";
import { DashboardOverview } from "@/features/dashboard/ui/DashboardOverview";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { useWorkspace } from "../hooks/use-workspace";
import { WorkspaceShell } from "./WorkspaceShell";

export default function Workspace() {
  const { data: session, isPending } = useSession();
  if (isPending)
    return (
      <main className="loading" role="status">
        Carregando seu espaço…
      </main>
    );
  if (!session) return <AccessForm service={frontendServices.auth} />;
  return <AuthenticatedWorkspace key={session.user.id} user={session.user} />;
}
function AuthenticatedWorkspace({
  user,
}: {
  user: { name: string; email: string };
}) {
  const services = frontendServices;
  const {
    screen,
    setScreen,
    dashboard,
    selected,
    error,
    setError,
    notice,
    setNotice,
    busy,
    run,
    refresh,
    openAnalysis,
  } = useWorkspace(services.dashboard, services.analysis);
  return (
    <WorkspaceShell
      user={user}
      screen={screen}
      onNavigate={(screen) => {
        setScreen(screen);
        setError("");
      }}
      onSettings={() => setScreen("settings")}
      onSignOut={() =>
        run(async () => {
          await services.auth.signOut();
          notifications.success("Sessão encerrada.");
        })
      }
    >
      {error && (
        <Alert role="alert" variant="destructive" className="mb-5">
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              type="button"
              onClick={() => setError("")}
              aria-label="Fechar aviso"
              className="float-right -mr-2 -mt-2 ml-3 size-11 p-0"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {notice && (
        <Alert role="status" variant="success" className="mb-5">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {dashboard && !dashboard.aiConfigured && (
        <Alert variant="warning" className="mb-5">
          <AlertDescription>
            A análise por IA aguarda configuração. Você já pode enviar e revisar
            seus currículos.
          </AlertDescription>
        </Alert>
      )}
      {screen === "home" && (
        <DashboardOverview
          userName={user.name}
          dashboard={dashboard}
          onNewAnalysis={() => setScreen("new")}
          onHistory={() => setScreen("history")}
          openAnalysis={openAnalysis}
        />
      )}
      {screen === "history" && (
        <AnalysisHistory
          analyses={dashboard?.analyses ?? []}
          onNewAnalysis={() => setScreen("new")}
          openAnalysis={openAnalysis}
        />
      )}
      {(screen === "new" || screen === "resumes") && (
        <NewAnalysisForm
          resumes={dashboard?.resumes ?? []}
          onlyResume={screen === "resumes"}
          busy={busy}
          run={run}
          refresh={refresh}
          onCreated={openAnalysis}
          notify={setNotice}
          resumeService={services.resumes}
          analysisService={services.analysis}
          vacancyService={services.vacancy}
        />
      )}
      {screen === "result" && selected && (
        <AnalysisResult
          analysis={selected}
          busy={busy}
          run={run}
          refresh={() => openAnalysis(selected.id)}
          onDeleted={() => {
            setScreen("history");
            void refresh();
          }}
          service={services.analysis}
          versions={services.versions}
        />
      )}
      {screen === "settings" && (
        <AccountSettings
          email={user.email}
          busy={busy}
          onDelete={(confirmation) =>
            run(async () => {
              await deleteAccount(
                services.account,
                services.auth,
                confirmation,
              );
              notifications.success("Conta excluída com sucesso.");
            })
          }
        />
      )}
    </WorkspaceShell>
  );
}
