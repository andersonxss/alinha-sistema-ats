export function readability(text: string) {
  const lines = text.split("\n");
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    warnings: [
      ...(text.length < 300
        ? ["Texto curto: confira se todas as experiências foram extraídas."]
        : []),
      ...(lines.some((l) => l.length > 500)
        ? [
            "Há parágrafos longos. Considere dividi-los para facilitar a leitura.",
          ]
        : []),
      ...(!/experi[eê]ncia|hist[oó]rico|atua[çc][aã]o/i.test(text)
        ? ["Não foi localizado um título de experiências profissionais."]
        : []),
    ],
  };
}
