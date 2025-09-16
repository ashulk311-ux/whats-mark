module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts',
    '!src/**/index.ts',
    '!src/**/routes.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@/whatsapp/(.*)$': '<rootDir>/src/whatsapp/$1',
    '^@/broadcast/(.*)$': '<rootDir>/src/broadcast/$1',
    '^@/contacts/(.*)$': '<rootDir>/src/contacts/$1',
    '^@/chatbot/(.*)$': '<rootDir>/src/chatbot/$1',
    '^@/ai/(.*)$': '<rootDir>/src/ai/$1',
    '^@/inbox/(.*)$': '<rootDir>/src/inbox/$1',
    '^@/campaigns/(.*)$': '<rootDir>/src/campaigns/$1',
    '^@/payments/(.*)$': '<rootDir>/src/payments/$1',
    '^@/analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  clearMocks: true,
  restoreMocks: true,
  verbose: true
};
