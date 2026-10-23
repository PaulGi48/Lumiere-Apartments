import express from "express";
import { createApp } from "./server/app";

const app = express();
createApp(app);

export default app;
