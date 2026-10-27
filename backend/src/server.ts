import { app } from "./app";
import { db } from "./infrastructure/database/db";

const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API SistemaATS ouvindo na porta ${port}.`);
});

async function shutdown() {
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
}
process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());
