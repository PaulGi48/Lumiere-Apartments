import express from "express";
import app from "./server/index.js";

// Keep a direct Express import here so Vercel detects this root shim.
void express;

export default app;
