import type { Analysis, Task } from "@/features/analysis/model/types";
import type { Resume } from "@/features/resumes/model/types";

export type Dashboard = {
  user: { name: string; email: string };
  resumes: Resume[];
  analyses: Analysis[];
  tasks: Task[];
  aiConfigured: boolean;
};
