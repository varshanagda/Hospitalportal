// Jest setup file to ensure NODE_ENV is set to 'test'
// This runs BEFORE any test files are loaded
process.env.NODE_ENV = 'test';

// Suppress console.error for database connection errors during tests
const originalError = console.error;
const originalLog = console.log;

console.error = (...args) => {
  // Filter out database connection errors during tests
  const message = args[0]?.toString() || '';
  if (
    message.includes('Database connection error') ||
    message.includes('Please check your database configuration') ||
    message.includes('Unexpected error on idle client')
  ) {
    // Silently ignore database connection errors in tests
    return;
  }
  // Allow other errors to be logged
  originalError.apply(console, args);
};

// Also suppress DB connection logs and dotenv messages
console.log = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('DB_HOST:') ||
    message.includes('DB_USER:') ||
    message.includes('DB_NAME:') ||
    message.includes('DB_PORT:') ||
    message.includes('Database connected successfully') ||
    message.includes('[dotenv@') ||
    message.includes('injecting env')
  ) {
    // Suppress database connection logs and dotenv messages in tests
    return;
  }
  // Allow other logs
  originalLog.apply(console, args);
};
