import { createClient, RedisClientType } from 'redis';
import env from './env';

let redisClient: RedisClientType | null = null;

export const initRedis = async (): Promise<RedisClientType | null> => {
  if (!env.enableRedis) {
    console.log('Redis disabled in config');
    return null;
  }

  try {
    redisClient = createClient({
      socket: {
        host: env.redis.host,
        port: env.redis.port,
      },
      password: env.redis.password,
    }) as unknown as RedisClientType;

    redisClient.on('error', (err: Error) => {
      console.error('Redis Client Error', err);
    });

    await redisClient.connect();
    console.log('Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis disconnected');
  }
};

export default redisClient;
