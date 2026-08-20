import { createApp } from "./app";
import { env } from "./lib/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`[api] listening on :${env.port}`);
});
