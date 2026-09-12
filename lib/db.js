import { createClient } from "@libsql/client";

// Env vars come from .env.local:
// TURSO_DATABASE_URL=libsql://your-db-name.turso.io
// TURSO_AUTH_TOKEN=xxxx
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
