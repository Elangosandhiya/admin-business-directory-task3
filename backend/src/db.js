let pool;

if (process.env.USE_PG_MEM === "true") {
  const { newDb } = require("pg-mem");
  const db = newDb();
  const { Pool: PgMemPool } = db.adapters.createPg();
  pool = new PgMemPool();
} else {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

module.exports = pool;
