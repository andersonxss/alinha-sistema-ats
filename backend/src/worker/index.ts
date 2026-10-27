import { db } from "@/infrastructure/database/db";
import { claimTask, recoverExhausted } from "@/infrastructure/queue/queue";
import { cleanFileGarbage, writeWorkerHealth } from "./maintenance";
import { runWorker } from "./run-worker";
import { processTask } from "./task-processor";

let stopping = false;
process.on("SIGTERM", requestShutdown);
process.on("SIGINT", requestShutdown);

function requestShutdown(): void {
  stopping = true;
}

void runWorker(
  {
    writeHealth: writeWorkerHealth,
    recoverExhaustedTasks: recoverExhausted,
    cleanFileGarbage,
    claimTask,
    processTask,
    disconnect: () => db.$disconnect(),
  },
  { shouldStop: () => stopping },
);
