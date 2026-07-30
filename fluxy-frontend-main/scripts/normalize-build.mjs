import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const assetsDirectory = fileURLToPath(
  new URL("../../fluxy-backend/public/assets/", import.meta.url)
);

const assetNames = await readdir(assetsDirectory);

await Promise.all(
  assetNames
    .filter((assetName) => assetName.endsWith(".js"))
    .map(async (assetName) => {
      const assetUrl = new URL(assetName, `file://${assetsDirectory}/`);
      const contents = await readFile(assetUrl, "utf8");
      const normalizedContents = contents.replace(/[\t ]+(?=\r?\n)/g, "");

      if (normalizedContents !== contents) {
        await writeFile(assetUrl, normalizedContents);
      }
    })
);
