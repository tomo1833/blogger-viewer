import db from './db';
import { sleep } from './utils';

export interface Comment {
  id?: number;
  postId: number;
  bloggerCommentId: string;
  author: string;
  content: string;
  published: string;
  updated: string;
}

export function getComments(postId?: number): Comment[] {
  if (postId !== undefined) {
    const stmt = db.prepare('SELECT * FROM comments WHERE postId=? ORDER BY published DESC');
    return stmt.all(postId) as Comment[];
  }
  const stmt = db.prepare('SELECT * FROM comments ORDER BY published DESC');
  return stmt.all() as Comment[];
}

export async function fetchCommentsFromBlogger(apiKey: string, blogId: string): Promise<Comment[]> {
  const posts = db.prepare('SELECT id, bloggerId FROM posts').all() as { id: number; bloggerId: string }[];
  const insert = db.prepare(
    'INSERT OR IGNORE INTO comments (postId, bloggerCommentId, author, content, published, updated) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((items: Comment[]) => {
    for (const c of items) {
      insert.run(c.postId, c.bloggerCommentId, c.author, c.content, c.published, c.updated);
    }
  });

  const allComments: Comment[] = [];
  for (const post of posts) {
    let pageToken: string | undefined;
    do {
      const url = new URL(
        `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${post.bloggerId}/comments`
      );
      url.searchParams.set('key', apiKey);
      url.searchParams.set(
        'fields',
        'nextPageToken,items(id,content,published,updated,author/displayName)'
      );
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch comments from Blogger');
      const data: {
        nextPageToken?: string;
        items?: {
          id: string;
          content: string;
          published: string;
          updated: string;
          author?: { displayName?: string };
        }[];
      } = await res.json();

      const comments: Comment[] = (data.items || []).map(item => ({
        postId: post.id,
        bloggerCommentId: item.id,
        author: item.author?.displayName || '',
        content: item.content,
        published: item.published,
        updated: item.updated,
      }));
      insertMany(comments);
      allComments.push(...comments);
      pageToken = data.nextPageToken;
      if (pageToken) {
        await sleep(1000);
      }
    } while (pageToken);
    await sleep(1000);
  }
  return getComments();
}
