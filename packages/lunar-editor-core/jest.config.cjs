module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/__tests__/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          esModuleInterop: true,
          isolatedModules: true,
        },
        diagnostics: false,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.cjs'],
  clearMocks: true,
};
