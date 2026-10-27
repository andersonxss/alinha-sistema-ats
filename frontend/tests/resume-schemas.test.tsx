import { describe, expect, it } from "vitest";
import {
  resumeReviewSchema,
  resumeUploadSchema,
} from "@/features/resumes/model/schemas";

describe("@spec:AC-003 validação de currículo", () => {
  it("limita o nome e o texto revisado e aceita valores nos limites", () => {
    const valid = { name: "Currículo", text: "x".repeat(150) };
    expect(resumeReviewSchema.safeParse(valid).success).toBe(true);
    expect(
      resumeReviewSchema.safeParse({ ...valid, name: "x".repeat(181) }).success,
    ).toBe(false);
    expect(
      resumeReviewSchema.safeParse({ ...valid, text: "x".repeat(149) }).success,
    ).toBe(false);
    expect(
      resumeReviewSchema.safeParse({ ...valid, text: "x".repeat(60_001) })
        .success,
    ).toBe(false);
  });

  it("aceita PDF e DOCX até 10 MB e rejeita formato ou tamanho inválido", () => {
    expect(
      resumeUploadSchema.safeParse(new File(["pdf"], "cv.PDF")).success,
    ).toBe(true);
    expect(
      resumeUploadSchema.safeParse(new File(["docx"], "cv.docx")).success,
    ).toBe(true);
    expect(
      resumeUploadSchema.safeParse(new File(["txt"], "cv.txt")).success,
    ).toBe(false);
    expect(
      resumeUploadSchema.safeParse(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], "cv.pdf"),
      ).success,
    ).toBe(false);
  });
});
