import assert from "node:assert/strict";
import test from "node:test";
import { runWorker, type WorkerDependencies } from "@/worker/run-worker";

test("runs maintenance while idle and disconnects after graceful shutdown", async () => {
  const calls: string[] = [];
  let stopping = false;
  const dependencies: WorkerDependencies = {
    async writeHealth() {
      calls.push("health");
    },
    async recoverExhaustedTasks() {
      calls.push("recover");
    },
    async cleanFileGarbage() {
      calls.push("garbage");
    },
    async claimTask() {
      calls.push("claim");
      return null;
    },
    async processTask() {
      calls.push("process");
    },
    async disconnect() {
      calls.push("disconnect");
    },
  };

  await runWorker(dependencies, {
    shouldStop: () => stopping,
    async wait(durationMs) {
      assert.equal(durationMs, 1_500);
      stopping = true;
    },
  });

  assert.deepEqual(calls, [
    "health",
    "recover",
    "garbage",
    "claim",
    "disconnect",
  ]);
});
