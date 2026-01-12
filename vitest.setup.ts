// vitest.setup.ts
// Global test setup (e.g., environment variables, mocks)
import dotenv from "dotenv";
import "@testing-library/jest-dom";

dotenv.config({ path: ".env.test" });

// You can add any global mocks here if needed.
