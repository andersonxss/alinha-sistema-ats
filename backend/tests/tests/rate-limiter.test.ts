import assert from "node:assert/strict";
import test from "node:test";
import { createRateLimiter } from "@/application/use-cases/rate-limiter";

test("limita requisições por usuário, ação e janela de um minuto", async () => {
  const keys: string[] = [];
  let count = 0;
  const limiter = createRateLimiter(
    {
      async deleteBefore() {},
      async increment(key) {
        keys.push(key);
        return ++count;
      },
    },
    () => 120_000,
  );

  assert.equal(await limiter("user-1", "analysis", 1), true);
  assert.equal(await limiter("user-1", "analysis", 1), false);
  assert.deepEqual(keys, ["app:analysis:user-1:2", "app:analysis:user-1:2"]);
});
