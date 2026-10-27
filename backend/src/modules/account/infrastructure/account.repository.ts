import type { IAccountRepository } from "@/domain/repositories/account.repository";
import { db } from "@/infrastructure/database/db";

export class AccountRepository implements IAccountRepository {
  async deleteAccount(userId: string): Promise<void> {
    await db.$transaction(async (tx) => {
      const resumes = await tx.resume.findMany({
        where: { userId },
        include: { versions: { include: { exports: true } } },
      });

      for (const resume of resumes) {
        const keys = [
          resume.fileKey,
          ...resume.versions.flatMap((version) =>
            version.exports.map((entry) => entry.fileKey),
          ),
        ].filter((key): key is string => !!key);
        for (const key of keys)
          await tx.fileGarbage.upsert({
            where: { key },
            create: { key },
            update: {},
          });
      }

      await tx.user.delete({ where: { id: userId } });
    });
  }
}
