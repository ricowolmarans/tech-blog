const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
require("dotenv").config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/seed-admin.js <email> <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const id = nanoid();

  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
    args: [id, email, hash],
  });

  console.log(`Admin user created: ${email}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
