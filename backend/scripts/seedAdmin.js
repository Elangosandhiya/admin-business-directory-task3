require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../src/db");

async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD before seeding.");
  }

  const adminSql = fs.readFileSync(path.join(__dirname, "../sql/001_admins.sql"), "utf8");
  await pool.query(adminSql);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_USERNAME, passwordHash]
  );

  console.log(`Admin "${ADMIN_USERNAME}" seeded.`);
}

seedAdmin()
  .catch((error) => {
    console.error("Could not seed admin:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
