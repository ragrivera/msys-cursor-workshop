require('dotenv').config();
require('ts-node').register({ transpileOnly: true });

const config = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'appointments_db',
      user: 'postgres',
      password: 'password',
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },

  test: {
    client: 'postgresql',
    connection: process.env.TEST_DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'appointments_test_db',
      user: 'postgres',
      password: 'password',
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
    pool: {
      min: 1,
      max: 2,
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './dist/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './dist/database/seeds',
      extension: 'js',
    },
    pool: {
      min: 2,
      max: 20,
    },
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
};

module.exports = config;
