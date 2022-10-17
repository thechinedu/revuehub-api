import 'dotenv/config';

import DBConfig, { environment } from '@/knexfile';
import knex from 'knex';
import { createClient } from 'redis';

export const db = knex(DBConfig[process.env.APP_ENV as environment]);

export const memoryStore = (async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.on('error', (err) => {
    console.log('Failed to set up in-memory store', err); // TODO: set up proper logger
  });
  await client.connect();
  return client;
})();
