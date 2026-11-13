
'use strict';

const Redis = require('ioredis');

// Create Redis instance
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
});

// Implement cacheGet
async function cacheGet(key) {
  try {
    const data = await redis.get(key);

    if (data === null) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('[cache] GET error:', error.message);
    return null;
  }
}

// Implement cacheSet
async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    console.error('[cache] SET error:', error.message);
  }
}

// Implement cacheDel
async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('[cache] DEL error:', error.message);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel };
