export interface IRateLimitRepository {
  deleteBefore(timestamp: number): Promise<void>;
  increment(key: string, timestamp: number): Promise<number>;
}
