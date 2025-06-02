import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from 'src/config';
export type RedisClient = ReturnType<typeof createClient>; // bukvalno koji tip bude na redis-u bice i ovde

export abstract class BaseCache {
  client: RedisClient;
  log: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }
}
