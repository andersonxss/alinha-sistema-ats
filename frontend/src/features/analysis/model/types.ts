import type { Version } from "@/features/versions/model/types";
export type Task = {
  id: string;
  kind: string;
  status: string;
  stage: string;
  attempts: number;
  availableAt: string;
  error: string | null;
};

export type Analysis = {
  id: string;
  status: string;
  score: number | null;
  createdAt: string;
  error: string | null;
  vacancy: { title: string; company: string };
  versions: Version[];
  tasks: Task[];
  rulesVersion: string;
  promptVersion: string;
  model: string;
  result: null | {
    summary: string;
    provisional: boolean;
    recommendations: string[];
    questions: string[];
    dimensions: { dimension: string; weight: number; score: number }[];
    requirements: {
      description: string;
      dimension: string;
      mandatory: boolean;
      classification: string;
      source: string;
      evidence: string | null;
      explanation: string;
      contribution: number;
    }[];
    readability: { words: number; warnings: string[] };
  };
};
