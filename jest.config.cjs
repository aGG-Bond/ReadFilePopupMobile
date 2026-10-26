module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testRegex: '/test/.*\\.(test|spec)\\.(c?js|ts|tsx)$',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'cjs'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json'
      }
    ],
  },
  testTimeout: 30000,
  setupFiles: ['<rootDir>/test/setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^pdfjs-dist$': '<rootDir>/test/__mocks__/pdfjs-dist.cjs'
  }
};