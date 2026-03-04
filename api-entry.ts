import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./server/_core/oauth";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import path from "path";
import fs from "fs";

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

// Serve static frontend build
const distPath = path.resolve(process.cwd(), "dist", "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  app.use("*", (_req, res) => {
    res.status(503).json({ error: "Frontend build not found. Run pnpm build first." });
  });
}

// Prevent unhandled errors from crashing the serverless function
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
