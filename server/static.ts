import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    index: false,
    setHeaders(res, filePath) {
      const filename = path.basename(filePath);
      const hasBuildHash = /-[\w-]{8,}\.[\w]+$/.test(filename);
      res.setHeader(
        "Cache-Control",
        hasBuildHash ? "public, max-age=31536000, immutable" : "public, max-age=3600",
      );
    },
  }));

  // Serve the SPA shell for browser navigation while keeping missing API
  // endpoints and asset requests as real 404s.
  app.use("/{*path}", (req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found" });
    }

    const acceptsHtml = req.get("accept")?.includes("text/html");
    if ((req.method !== "GET" && req.method !== "HEAD") || !acceptsHtml) {
      return next();
    }

    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.resolve(distPath, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}
