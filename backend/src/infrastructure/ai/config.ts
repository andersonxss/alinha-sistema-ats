import { AiNotConfiguredError } from "@/domain/errors/analysis-errors";

function value(name: "GEMINI_API_KEY" | "GEMINI_MODEL") {
  return process.env[name]?.trim() ?? "";
}

export function aiConfigurationStatus() {
  const apiKey = value("GEMINI_API_KEY");
  const model = value("GEMINI_MODEL");
  return {
    configured: Boolean(apiKey && model),
    modelConfigured: Boolean(model),
  };
}

export function getAiConfig() {
  const apiKey = value("GEMINI_API_KEY");
  const model = value("GEMINI_MODEL");
  if (!apiKey || !model) throw new AiNotConfiguredError();
  return { apiKey, model };
}
