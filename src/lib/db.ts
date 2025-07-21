import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'blog.db'));

// Ensure posts and comments tables exist
const init = `
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bloggerId TEXT UNIQUE,
  title TEXT,
  content TEXT,
  url TEXT,
  published TEXT,
  updated TEXT
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postId INTEGER,
  bloggerCommentId TEXT UNIQUE,
  author TEXT,
  content TEXT,
  published TEXT,
  updated TEXT,
  FOREIGN KEY(postId) REFERENCES posts(id)
);`;

db.exec(init);

export default db;
