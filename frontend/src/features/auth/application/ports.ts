export interface AuthService {
  signIn(input: {
    email: string;
    password: string;
  }): Promise<{ error?: { code?: string } | null }>;
  signUp(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ error?: { code?: string } | null }>;
  signOut(): Promise<unknown>;
}
