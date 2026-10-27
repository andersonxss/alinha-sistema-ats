import type { IAccountRepository } from "@/domain/repositories/account.repository";

export class AccountService {
  constructor(private readonly repository: IAccountRepository) {}
  delete(userId: string) {
    return this.repository.deleteAccount(userId);
  }
}
