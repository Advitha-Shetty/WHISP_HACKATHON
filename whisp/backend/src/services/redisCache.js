/**
 * Optional Redis cache — GET /api/districts responses when REDIS_URL is set.
 */

let client = null;
let initialized = false;

async function getRedisClient() {
  if (initialized) return client;
  initialized = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const { createClient } = require('redis');
    client = createClient({ url });
    client.on('error', (err) => console.error('Redis error:', err.message));
    await client.connect();
    console.log('Redis cache connected');
    return client;
  } catch (e) {
    console.warn('Redis unavailable, caching disabled:', e.message);
    client = null;
    return null;
  }
}

async function cacheGet(key) {
  const c = await getRedisClient();
  if (!c) return null;
  try {
    const v = await c.get(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 60) {
  const c = await getRedisClient();
  if (!c) return;
  try {
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (e) {
    console.warn('Redis set failed:', e.message);
  }
}

async function cacheDel(key) {
  const c = await getRedisClient();
  if (!c) return;
  try {
    await c.del(key);
  } catch {
    /* ignore */
  }
}

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel };
