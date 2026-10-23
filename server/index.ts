import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { createApp, log } from "./app";

const app = express();
const { ready } = createApp(app);
const port = parseInt(process.env.PORT || "5000", 10);

if (!process.env.VERCEL) {
  void ready
    .then(() => {
      createServer(app).listen(
        {
          port,
          host: "0.0.0.0",
        },
        () => log(`serving on port ${port}`),
      );
    })
    .catch((err) => {
      console.error("Could not start the server:", err);
      process.exitCode = 1;
    });
}

export default app;
