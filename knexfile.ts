import type { Knex } from 'knex';

export type environment = 'development' | 'test' | 'staging' | 'production';

const config: { [key in environment]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },

  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },

  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'schema_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'schema_migrations',
    },
  },
};

export default config;
