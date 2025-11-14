import type { Config } from 'jest';

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts?$": ["ts-jest", {}],
  },
};

export default config;
