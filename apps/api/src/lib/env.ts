function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET"),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3001",
  nodeEnv: process.env.NODE_ENV ?? "development",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6380",
  wahaBaseUrl: process.env.WAHA_BASE_URL ?? "http://localhost:3000",
  wahaApiKey: process.env.WAHA_API_KEY ?? "dev-only-key",
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://localhost:4000",
  credentialsEncryptionKey: required("CREDENTIALS_ENCRYPTION_KEY"),
};
