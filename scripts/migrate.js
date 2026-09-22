const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Load .env.local from project root (works whether you run from root or scripts/)
require("dotenv").config({
  path: path.join(__dirname, "..", ".env.local"),
});

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Copy .env.example to .env.local and fill them in."
  );
  process.exit(1);
}

const db = createClient({ url, authToken });

async function run() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log("Running migration: " + file);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");

    // Strip full-line comments and trailing inline -- comments
    const cleaned = sql
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("--")) return "";
        // Remove inline -- comments (SQLite style)
        const commentIdx = line.indexOf("--");
        if (commentIdx >= 0) return line.slice(0, commentIdx);
        return line;
      })
      .join("\n");

    const statements = cleaned
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      const preview = stmt.slice(0, 70).replace(/\s+/g, " ");
      console.log("  -> " + preview + (stmt.length > 70 ? "..." : ""));
      await db.execute(stmt);
    }
  }

  console.log("Migrations complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
