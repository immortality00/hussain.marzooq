import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Match the `@/*` -> `./*` alias from tsconfig. Regex form so only `@/` is
  // rewritten and scoped npm packages (`@gsap/react`, `@dnd-kit/core`) are left alone.
  resolve: {
    alias: [{ find: /^@\//, replacement: `${root}/` }],
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Dummy values so modules that read these at import time don't throw or hit
    // the network. `lib/mongodb.ts` throws without MONGODB_URI, and MongoClient's
    // connect promise is never awaited at import so no real connection is made.
    env: {
      MONGODB_URI: "mongodb://127.0.0.1:27017",
      MONGODB_DB_NAME: "hm_visuals_test",
      RESEND_API_KEY: "test_resend_key",
    },
  },
});
