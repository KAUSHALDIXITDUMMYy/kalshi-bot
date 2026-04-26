import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://kalshi:kalshibot123@localhost:5433/rfqbot?sslmode=disable',
});

export default pool;
