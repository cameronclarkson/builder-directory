import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./server/_core/oauth";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "node:url";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static frontend build — resolve path from bundle location (Vercel) or cwd (local)
const bundleDir = path.dirname(fileURLToPath(import.meta.url));
const distPathFromBundle = path.resolve(bundleDir, "public");
const distPathFromCwd = path.resolve(process.cwd(), "dist", "public");
const distPath = fs.existsSync(distPathFromBundle)
  ? distPathFromBundle
  : distPathFromCwd;

if (fs.existsSync(distPath)) {
  console.log("[API] Serving static from:", distPath);
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  console.error("[API] Frontend build not found. Tried:", distPathFromBundle, "and", distPathFromCwd);
  app.use("*", (_req, res) => {
    res.status(503).json({
      error: "Frontend build not found.",
      tried: [distPathFromBundle, distPathFromCwd],
    });
  });
}

// Prevent unhandled errors from crashing the serverless function
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error("[API] Unhandled error:", message, stack ?? "");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
