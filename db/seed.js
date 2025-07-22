import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool();

async function seed() {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');

  const passwordHash = await bcrypt.hash('password123', 10);
  const userRes = await pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
    ['testuser', passwordHash]
  );
  const userId = userRes.rows[0].id;

  await pool.query(
    'INSERT INTO tasks (user_id, title, done) VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)',
    [userId, 'First Task', false, 'Second Task', true, 'Third Task', false]
  );

  console.log('🌱 Database seeded.');
  await pool.end();
}

seed();