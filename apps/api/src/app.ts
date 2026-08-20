import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.webOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", authRouter);
  app.use("/products", productsRouter);

  return app;
}
