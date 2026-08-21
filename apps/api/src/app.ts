import express, { type Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { whatsappRouter } from "./routes/whatsapp";
import { aiRouter } from "./routes/ai";
import { conversationsRouter } from "./routes/conversations";
import { broadcastRouter } from "./routes/broadcast";
import { followUpRouter } from "./routes/followup";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.webOrigin, credentials: true }));
  app.use(
    express.json({
      // Webhook signature verification (WAHA HMAC, Meta X-Hub-Signature-256) must hash the exact
      // bytes the provider signed — re-serializing req.body would not reliably match.
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    })
  );
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", authRouter);
  app.use("/products", productsRouter);
  app.use("/whatsapp", whatsappRouter);
  app.use("/ai", aiRouter);
  app.use("/conversations", conversationsRouter);
  app.use("/broadcast", broadcastRouter);
  app.use("/followup", followUpRouter);

  return app;
}
