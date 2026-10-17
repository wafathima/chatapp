
// import pg from "pg";
// import "dotenv/config";

// const { Pool } = pg;

// const pool = new Pool({
//   host: process.env.DB_HOST ?? "localhost",
//   port: Number(process.env.DB_PORT ?? 5432),
//   database: process.env.DB_NAME ?? "chatflow_db",
//   user: process.env.DB_USER ?? "postgres",
//   password: process.env.DB_PASSWORD,
//   max: 10,
//   idleTimeoutMillis: 30_000,
//   connectionTimeoutMillis: 5_000,
// });

// pool.on("error", (error) => {
//   console.error("Unexpected PostgreSQL pool error:", error);
// });

// export default pool;


import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default pool;
