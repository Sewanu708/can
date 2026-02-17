// lib/storage.ts
import { redis, setWithExpiry, get, del } from './redis';


interface Storage {
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

const redisStorage: Storage = {
  set: setWithExpiry,
  get,
  delete: del,
};

export const storage: Storage =  redisStorage;
