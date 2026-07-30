import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const assetsDirectory = fileURLToPath(
  new URL("../../fluxy-backend/public/assets/", import.meta.url)
);

await rm(assetsDirectory, { recursive: true, force: true });
await mkdir(assetsDirectory, { recursive: true });
