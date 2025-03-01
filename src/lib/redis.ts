import Redis from 'ioredis';
import NodeCache from 'node-cache';

// Fallback to in-memory cache if Redis is not available
const localCache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// Initialize Redis client if REDIS_URL is provided, otherwise use in-memory cache
let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
    console.log('Redis client initialized');
  } else {
    console.log('REDIS_URL not provided, using in-memory cache');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

/**
 * Get cached data
 * @param key Cache key
 * @returns Cached data or null
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first if available
    if (redis) {
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } else {
      // Fallback to in-memory cache
      const data = localCache.get<T>(key);
      if (data !== undefined) {
        return data;
      }
    }
  } catch (error) {
    console.error(`Error getting cached data for key ${key}:`, error);
  }
  
  return null;
}

/**
 * Set cached data
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (default: 600 seconds = 10 minutes)
 */
export async function setCachedData<T>(key: string, data: T, ttl = 600): Promise<void> {
  try {
    const serializedData = JSON.stringify(data);
    
    if (redis) {
      await redis.set(key, serializedData, 'EX', ttl);
    } else {
      localCache.set(key, data, ttl);
    }
  } catch (error) {
    console.error(`Error setting cached data for key ${key}:`, error);
  }
}

/**
 * Delete cached data
 * @param key Cache key
 */
export async function deleteCachedData(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
    } else {
      localCache.del(key);
    }
  } catch (error) {
    console.error(`Error deleting cached data for key ${key}:`, error);
  }
}

/**
 * Clear cache with a pattern (Redis only)
 * @param pattern Key pattern to match (e.g., "articles:*")
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      console.warn('Pattern-based cache clearing not supported with in-memory cache');
    }
  } catch (error) {
    console.error(`Error clearing cache with pattern ${pattern}:`, error);
  }
}

export default redis;
