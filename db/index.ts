import 'dotenv/config';

import DBConfig from '@/knexfile';
import knex from 'knex';

console.log({ env: process.env.APP_ENV });
export const db = knex(DBConfig[process.env.APP_ENV]);
