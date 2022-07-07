import 'dotenv/config';

import DBConfig from '@/knexfile';
import knex from 'knex';

export const db = knex(DBConfig[process.env.NODE_ENV]);
