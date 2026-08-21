import type { WhatsAppConnection } from "@fluxy-crm/db";
import { decryptCredentials } from "../crypto";
import type { WhatsAppProvider } from "./provider";
import { WahaProvider, type WahaCredentials } from "./waha";
import { MetaProvider, type MetaCredentials } from "./meta";

export function buildProvider(connection: WhatsAppConnection): WhatsAppProvider {
  const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted));
  if (connection.provider === "WAHA") {
    return new WahaProvider(credentials as WahaCredentials);
  }
  return new MetaProvider(credentials as MetaCredentials);
}

export * from "./provider";
