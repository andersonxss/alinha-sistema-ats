import type { Analysis } from "@/features/analysis/model/types";
import type { Resume } from "@/features/resumes/model/types";
import type { Version } from "@/features/versions/model/types";
import type { Dashboard } from "@/features/dashboard/model/types";
export const resume: Resume = {
  id: "resume-1",
  name: "Currículo",
  reviewedText: "Experiência profissional. ".repeat(12),
  extractionWarning: null,
  sections: {},
};
export const version: Version = {
  id: "version-1",
  originalText: "Original. ".repeat(30),
  proposedText: "Proposta. ".repeat(30),
  approvedText: null,
  revision: 2,
  suggestions: [],
  exports: [{ id: "export-1", format: "pdf", revision: 2 }],
};
export function analysis(id = "analysis-1"): Analysis {
  return {
    id,
    status: "pending",
    score: null,
    createdAt: "2026-10-17T12:00:00Z",
    error: null,
    vacancy: { title: "Analista", company: "Empresa" },
    versions: [],
    tasks: [],
    rulesVersion: "1",
    promptVersion: "1",
    model: "test",
    result: null,
  };
}
export const dashboard: Dashboard = {
  user: { name: "Pessoa", email: "teste@example.com" },
  resumes: [resume],
  analyses: [analysis()],
  tasks: [],
  aiConfigured: true,
};
