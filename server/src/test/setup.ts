import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Mock logger to prevent console output during tests
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  // Add any global teardown here
});
