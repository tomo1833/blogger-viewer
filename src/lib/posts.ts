import db from './db';

export interface Post {
  id?: number;
  bloggerId?: string;
  title: string;
  content: string;
  url?: string;
  published?: string;
  updated?: string;
}

export function getAllPosts(): Post[] {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY published DESC');
  return stmt.all() as Post[];
}

export function createPost(post: Post): Post {
  const stmt = db.prepare(
    'INSERT INTO posts (bloggerId, title, content, url, published, updated) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(
    post.bloggerId,
    post.title,
    post.content,
    post.url,
    post.published,
    post.updated
  );
  return { ...post, id: Number(info.lastInsertRowid) };
}

export function updatePost(post: Post): Post {
  const stmt = db.prepare(
    'UPDATE posts SET title=?, content=?, url=?, published=?, updated=? WHERE id=?'
  );
  stmt.run(post.title, post.content, post.url, post.published, post.updated, post.id);
  return post;
}

export function deletePost(id: number): void {
  db.prepare('DELETE FROM posts WHERE id=?').run(id);
}

export async function fetchFromBlogger(apiKey: string, blogId: string): Promise<Post[]> {
  const res = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}`
  );
  if (!res.ok) throw new Error('Failed to fetch from Blogger');
  const data: { items: { id: string; title: string; content: string; url: string; published: string; updated: string }[] } = await res.json();
  const posts: Post[] = data.items.map((item) => ({
    bloggerId: item.id,
    title: item.title,
    content: item.content,
    url: item.url,
    published: item.published,
    updated: item.updated,
  }));
  const insert = db.prepare(
    'INSERT OR IGNORE INTO posts (bloggerId, title, content, url, published, updated) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((items: Post[]) => {
    for (const p of items) {
      insert.run(p.bloggerId, p.title, p.content, p.url, p.published, p.updated);
    }
  });
  insertMany(posts);
  return getAllPosts();
}
