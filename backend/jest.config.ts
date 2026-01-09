import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.(ts|js)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
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
      branches: 50,
      functions: 50,
      lines: 70,
      statements: 70
    }
  }
};

export default config;
