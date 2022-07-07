import type { Knex } from 'knex';

type environment = 'development' | 'staging' | 'production';

const config: { [key in environment]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },

  // TODO: update staging and production config

  staging: {
    client: 'pg',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
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
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
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
