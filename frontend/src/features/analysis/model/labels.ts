export const dimensionLabels: Record<string, string> = {
  technical: "Competências técnicas",
  responsibilities: "Experiências e responsabilidades",
  seniority: "Senioridade e experiência",
  education: "Formação e certificações",
  languages: "Idiomas e outros requisitos",
};

export const classificationLabels: Record<string, string> = {
  met: "Atendido",
  partial: "Parcialmente atendido",
  missing: "Não evidenciado",
  confirm: "Precisa de confirmação",
};

export function statusVariant(status: string) {
  if (["completed", "met"].includes(status)) return "success";
  if (["processing", "partial", "confirm"].includes(status)) return "warning";
  if (["failed", "missing"].includes(status)) return "destructive";
  return "secondary";
}
export const statusLabels: Record<string, string> = {
  pending: "Na fila",
  processing: "Em processamento",
  completed: "Concluída",
  failed: "Falhou",
};
