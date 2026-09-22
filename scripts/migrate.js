const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    console.log("Running migration: " + file);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");

    const cleaned = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    const statements = cleaned
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      console.log("  -> " + stmt.slice(0, 60).replace(/\n/g, " ") + "...");
      await db.execute(stmt);
    }
  }
  console.log("Migrations complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
