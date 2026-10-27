import type { HealthService } from "@/modules/health/application/health.service";
export function createGET(service: HealthService) {
  return async function GET() {
    const available = await service.check();
    return Response.json(
      { status: available ? "ok" : "unavailable" },
      { status: available ? 200 : 503 },
    );
  };
}
