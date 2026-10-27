import type { Task } from "@/generated/prisma/client";

const IDLE_POLL_INTERVAL_MS = 1_500;
const ERROR_RETRY_INTERVAL_MS = 5_000;

export interface WorkerDependencies {
  writeHealth(): Promise<void>;
  recoverExhaustedTasks(): Promise<void>;
  cleanFileGarbage(): Promise<void>;
  claimTask(): Promise<Task | null>;
  processTask(task: Task): Promise<void>;
  disconnect(): Promise<void>;
}

type WorkerOptions = {
  shouldStop(): boolean;
  wait?(durationMs: number): Promise<void>;
};

export async function runWorker(
  dependencies: WorkerDependencies,
  options: WorkerOptions,
): Promise<void> {
  const wait = options.wait ?? delay;
  console.log("Worker iniciado.");

  try {
    while (!options.shouldStop()) {
      try {
        await runMaintenance(dependencies);
        const task = await dependencies.claimTask();
        if (task) await dependencies.processTask(task);
        else await wait(IDLE_POLL_INTERVAL_MS);
      } catch {
        console.error("Worker indisponível; nova tentativa em 5 segundos.");
        await wait(ERROR_RETRY_INTERVAL_MS);
      }
    }
  } finally {
    await dependencies.disconnect();
  }
}

async function runMaintenance(dependencies: WorkerDependencies): Promise<void> {
  await dependencies.writeHealth();
  await dependencies.recoverExhaustedTasks();
  await dependencies.cleanFileGarbage();
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
