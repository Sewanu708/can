// lib/redis.ts
import { Redis } from '@upstash/redis';
import { TTL_SECONDS } from './types';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Store data with automatic expiration
 */
export async function setWithExpiry<T>(
  key: string,
  value: T,
  ttl: number = TTL_SECONDS
): Promise<void> {
  await redis.set(key, JSON.stringify(value), { ex: ttl });
}

/**
 * Get data from Redis
 */
export async function get<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  
  // Upstash returns parsed JSON automatically
  return data as T;
}

/**
 * Delete data from Redis
 */
export async function del(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Check if key exists
 */
export async function exists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}
