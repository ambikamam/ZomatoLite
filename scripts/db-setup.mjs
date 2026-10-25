import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf-8');
    const seed = readFileSync(join(__dirname, '../db/seed.sql'), 'utf-8');
    
    console.log('Applying schema...');
    // Split by semicolons and run statements separately
    const schemaStmts = schema.split(';').filter(s => s.trim());
    for (const stmt of schemaStmts) {
      if (stmt.trim()) {
        await sql.query(stmt);
      }
    }
    console.log('Schema applied.');
    
    console.log('Applying seed...');
    const seedStmts = seed.split(';').filter(s => s.trim());
    for (const stmt of seedStmts) {
      if (stmt.trim()) {
        await sql.query(stmt);
      }
    }
    console.log('Seed applied.');
    
    const restaurants = await sql`SELECT * FROM restaurants`;
    const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at ASC`;
    
    console.log('\n--- Restaurants ---');
    console.log(JSON.stringify(restaurants, null, 2));
    console.log('\n--- Reviews ---');
    console.log(JSON.stringify(reviews, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

run();
