import knex from 'knex';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexfile = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';

export const db = knex(knexfile[environment]);
