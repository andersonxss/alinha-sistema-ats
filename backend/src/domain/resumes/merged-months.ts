import type { ExperiencePeriod } from "@/domain/repositories/experience-period.contract";

export function mergedMonths(periods: ExperiencePeriod[]) {
  const ranges = periods
    .map((p) => {
      const month = (s: string) => {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s))
          throw new Error("Data inválida");
        const [y, m] = s.split("-").map(Number);
        return y * 12 + m - 1;
      };
      const a = month(p.start),
        b = month(p.end);
      if (b < a) throw new Error("Período inválido");
      return [a, b + 1];
    })
    .sort((a, b) => a[0] - b[0]);
  let count = 0,
    start = -1,
    end = -1;
  for (const [a, b] of ranges) {
    if (a > end) {
      if (end >= 0) count += end - start;
      start = a;
      end = b;
    } else end = Math.max(end, b);
  }
  return count + (end >= 0 ? end - start : 0);
}
