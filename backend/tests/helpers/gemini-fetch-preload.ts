const originalFetch = globalThis.fetch;
const controlledUrl = process.env.TEST_GEMINI_URL;

if (!controlledUrl)
  throw new Error("TEST_GEMINI_URL é obrigatório no teste de integração.");

globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (!url.startsWith("https://generativelanguage.googleapis.com/"))
    return originalFetch(input, init);
  return originalFetch(controlledUrl, init);
};
