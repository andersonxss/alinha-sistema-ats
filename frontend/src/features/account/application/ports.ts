export interface AccountService {
  remove(confirmation: string): Promise<unknown>;
}
