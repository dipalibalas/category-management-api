import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts?$': ['ts-jest', {}],
  },
  moduleNameMapper: {
    '^(.*)\\.js$': '$1',  // allow ESM-style imports without .js error
  },
};

export default config;
