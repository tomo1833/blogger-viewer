'use client';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  published: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts);
  }, []);

  const refresh = () => {
    fetch('/api/posts?refresh=1')
      .then(res => res.json())
      .then(setPosts);
  };

  const create = async () => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setPosts(prev => [data, ...prev]);
    setTitle('');
    setContent('');
  };

  const remove = async (id: number) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Posts</h1>
      <button className="bg-blue-500 text-white px-2 py-1" onClick={refresh}>
        Refresh from Blogger
      </button>
      <div className="space-y-2">
        <input
          className="border p-1"
          placeholder="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border p-1 w-full"
          placeholder="content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button className="bg-green-500 text-white px-2 py-1" onClick={create}>
          Create
        </button>
      </div>
      <ul className="space-y-4">
        {posts.map(p => (
          <li key={p.id} className="border p-2">
            <h2 className="font-semibold">{p.title}</h2>
            <button className="text-red-500" onClick={() => remove(p.id)}>
              Delete
            </button>
            <div dangerouslySetInnerHTML={{ __html: p.content }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
