import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.(ts|js)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Set NODE_ENV to test - runs before all tests
  setupFiles: ['<rootDir>/src/tests/setup.js'],
  // Suppress console logs during tests (optional)
  silent: false,
  // Set test environment variables
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
      }
    }],
    '^.+\\.(js|jsx)$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
      }
    }],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  coverageThreshold: {
    global: {
      branches: 20,  // Lowered for initial setup - can increase as tests are added
      functions: 20,  // Lowered for initial setup - can increase as tests are added
      lines: 20,      // Lowered for initial setup - can increase as tests are added
      statements: 20  // Lowered for initial setup - can increase as tests are added
    }
  },
  // Set environment variables for tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
};

export default config;
