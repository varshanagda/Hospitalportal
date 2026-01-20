const { Pool } = require('pg');

// Detect test environment - check multiple indicators
// This needs to be checked at module load time
const isTestEnv = 
  process.env.NODE_ENV === 'test' || 
  process.env.JEST_WORKER_ID !== undefined ||
  process.argv.some(arg => arg.includes('jest')) ||
  process.argv.some(arg => arg.includes('test')) ||
  process.argv.some(arg => arg.includes('--test')) ||
  process.argv.some(arg => arg.includes('--runInBand'));

// Only log in non-test environments
if (!isTestEnv) {
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'authdb',
  port: Number(process.env.DB_PORT) || 5432,
});

// Handle connection errors - suppress in test environment
pool.on('error', (err, client) => {
  if (!isTestEnv) {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
  }
  // In test environment, silently handle the error
});

// Test connection (ONLY in non-test environments)
// This runs asynchronously and should not block tests
if (!isTestEnv) {
  // Use process.nextTick to defer execution until after module load
  process.nextTick(() => {
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('Please check your database configuration and ensure PostgreSQL is running.');
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});
  });
}

module.exports = pool;
