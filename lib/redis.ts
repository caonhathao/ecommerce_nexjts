import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL!,
    });
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  console.log('Redis Client Connected');
  return redisClient;
};

export default getRedisClient;
