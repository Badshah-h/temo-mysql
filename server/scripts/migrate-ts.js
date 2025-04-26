#!/usr/bin/env node
require('ts-node/register');
require('../db/knexfile.ts');
require('knex')(require('../db/knexfile.ts').default[process.env.NODE_ENV || 'development']).migrate.latest().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
