import assert from "node:assert/strict";
import test from "node:test";
import { UnauthenticatedError } from "@/domain/errors/user-errors";
import { AccountService } from "@/modules/account/application/account.service";
import { createDELETE } from "@/modules/account/presentation/http/account.route";
import { UserService } from "@/modules/user/application/user.service";
import { UserSessionRepository } from "@/modules/user/infrastructure/user-session.repository";
import { HttpError } from "@/presentation/http/http-error";
import { createRequireUser } from "@/presentation/http/require-user";

const user = {
  id: "user-test",
  name: "Synthetic User",
  email: "synthetic@example.test",
};
const origin = "http://localhost:3000";

test("autenticação consulta a sessão com dados simples e retorna o usuário", async () => {
  const credentials = {
    cookie: "synthetic-session",
    authorization: "synthetic-token",
  };
  const authenticate = new UserService({
    async findUser(input) {
      assert.deepEqual(input, credentials);
      return user;
    },
  });
  assert.deepEqual(await authenticate.authenticate(credentials), user);
});

test("sessão ausente ou inválida gera erro da aplicação", async () => {
  const authenticate = new UserService({
    async findUser() {
      return null;
    },
  });
  await assert.rejects(authenticate.authenticate({}), UnauthenticatedError);
  await assert.rejects(
    authenticate.authenticate({ cookie: "invalid" }),
    UnauthenticatedError,
  );
});

test("adaptador Better Auth preserva cabeçalhos e expõe apenas a identidade necessária", async () => {
  const repository = new UserSessionRepository({
    async getSession({ headers }) {
      assert.equal(headers.get("cookie"), "synthetic-session");
      assert.equal(headers.get("authorization"), "synthetic-token");
      assert.equal(headers.get("x-forwarded-for"), "127.0.0.1");
      return { user: { ...user, internal: "not exposed" } };
    },
  });
  assert.deepEqual(
    await repository.findUser({
      cookie: "synthetic-session",
      authorization: "synthetic-token",
      "x-forwarded-for": "127.0.0.1",
    }),
    user,
  );
  const absent = new UserSessionRepository({
    async getSession() {
      return null;
    },
  });
  assert.equal(await absent.findUser({}), null);
});

test("falha do provedor não é transformada em sessão inválida", async () => {
  const failure = new Error("provider unavailable");
  const authenticate = new UserService(
    new UserSessionRepository({
      async getSession() {
        throw failure;
      },
    }),
  );
  const requireUser = createRequireUser(authenticate, origin);
  await assert.rejects(
    requireUser(new Request("http://localhost/api/dashboard")),
    (error) => error === failure,
  );
});

test("GET e HEAD consultam sessão sem Origin e ausência vira 401", async () => {
  const requireUser = createRequireUser(
    new UserService({
      async findUser() {
        return null;
      },
    }),
    origin,
  );
  for (const method of ["GET", "HEAD"]) {
    await assert.rejects(
      requireUser(new Request("http://localhost/api/dashboard", { method })),
      (error) => error instanceof HttpError && error.status === 401,
    );
  }
});

test("mutações verificam origem antes de consultar a sessão", async () => {
  let lookups = 0;
  const requireUser = createRequireUser(
    new UserService({
      async findUser() {
        lookups++;
        return user;
      },
    }),
    origin,
  );
  for (const method of ["POST", "PATCH", "DELETE"]) {
    for (const headers of [
      new Headers(),
      new Headers({ origin: "https://invalid.test" }),
    ]) {
      await assert.rejects(
        requireUser(
          new Request("http://localhost/api/account", { method, headers }),
        ),
        (error) => error instanceof HttpError && error.status === 403,
      );
    }
  }
  assert.equal(lookups, 0);
  assert.deepEqual(
    await requireUser(
      new Request("http://localhost/api/account", {
        method: "DELETE",
        headers: { origin },
      }),
    ),
    user,
  );
  assert.equal(lookups, 1);
});

test("rota de conta usa autenticação injetada e mantém confirmação e respostas HTTP", async () => {
  const deleted: string[] = [];
  const service = new AccountService({
    async deleteAccount(id) {
      deleted.push(id);
    },
  });
  const authenticated = createRequireUser(
    new UserService({
      async findUser() {
        return user;
      },
    }),
    origin,
  );
  const request = (confirmation: string) =>
    new Request("http://localhost/api/account", {
      method: "DELETE",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
  const handler = createDELETE(service, authenticated);
  const invalid = await handler(request("wrong@example.test"));
  assert.equal(invalid.status, 400);
  assert.deepEqual(deleted, []);
  const success = await handler(request(user.email));
  assert.equal(success.status, 200);
  assert.deepEqual(await success.json(), { ok: true });
  assert.deepEqual(deleted, [user.id]);
  const unauthenticated = createDELETE(
    service,
    createRequireUser(
      new UserService({
        async findUser() {
          return null;
        },
      }),
      origin,
    ),
  );
  const rejected = await unauthenticated(request(user.email));
  assert.equal(rejected.status, 401);
  assert.deepEqual(await rejected.json(), {
    code: "UNAUTHENTICATED",
    error: "Entre na sua conta para continuar.",
  });
  assert.deepEqual(deleted, [user.id]);
});
