require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in the environment.");
}

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const app = require("./app");
const pool = require("./db");
const port = process.env.PORT || 4000;

async function initializeDatabase() {
  const sqlFiles = [
    path.join(__dirname, "../sql/000_directory_schema.sql"),
    path.join(__dirname, "../sql/001_admins.sql")
  ];

  for (const file of sqlFiles) {
    const sql = fs.readFileSync(file, "utf8");
    await pool.query(sql);
  }
}

async function seedAdminIfNeeded() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_USERNAME, passwordHash]
  );
}

async function startServer() {
  await initializeDatabase();
  await seedAdminIfNeeded();

  const server = app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });

  async function shutDown() {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutDown);
  process.on("SIGTERM", shutDown);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
