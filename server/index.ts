import "dotenv/config";
import { createServer } from "http";
import { createApp, log } from "./app";

const port = parseInt(process.env.PORT || "5000", 10);

const { app, ready } = createApp();

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
