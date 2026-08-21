import crypto from "node:crypto";
import { env } from "./env";

const ALGORITHM = "aes-256-gcm";

// CREDENTIALS_ENCRYPTION_KEY must be a 32-byte key, base64-encoded (openssl rand -base64 32).
const key = Buffer.from(env.credentialsEncryptionKey, "base64");

export function encryptCredentials(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((buf) => buf.toString("base64")).join(".");
}

export function decryptCredentials(ciphertext: string): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
