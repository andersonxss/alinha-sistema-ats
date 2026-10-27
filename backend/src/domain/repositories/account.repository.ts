import type { WebHandler } from "./http-handler.contract";

export interface IAccountHandlers {
  deleteAccount: WebHandler;
}

export interface IAccountRepository {
  deleteAccount(userId: string): Promise<void>;
}
