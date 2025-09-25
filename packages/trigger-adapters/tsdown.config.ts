import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  platform: "node",
  format: ["esm", "cjs"],
  external: ["express", "hono", "next", "@trigger.dev/sdk"],
  dts: true,
  sourcemap: true,
  entry: {
    nextjs: "./src/nextjs.ts",
    hono: "./src/hono.ts",
    express: "./src/express.ts",
    fastify: "./src/fastify.ts",
  },
});
