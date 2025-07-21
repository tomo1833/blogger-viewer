import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'blog.db'));

// Ensure posts table exists
const init = `
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bloggerId TEXT UNIQUE,
  title TEXT,
  content TEXT,
  url TEXT,
  published TEXT,
  updated TEXT
);`;

db.exec(init);

export default db;
