export type WorkspaceScreen =
  | "home"
  | "new"
  | "resumes"
  | "history"
  | "result"
  | "settings";
export const navigationItems: {
  id: WorkspaceScreen;
  label: string;
  icon: string;
}[] = [
  { id: "home", label: "Visão geral", icon: "home" },
  { id: "new", label: "Nova análise", icon: "plus" },
  { id: "resumes", label: "Meus currículos", icon: "resume" },
  { id: "history", label: "Histórico", icon: "history" },
];
