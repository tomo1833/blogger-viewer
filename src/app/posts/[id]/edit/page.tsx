'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Post {
  id: number;
  title: string;
  content: string;
  published?: string;
}

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    // Avoid hydration mismatches when this component is rendered on the server
    // by explicitly disabling immediate rendering as recommended by Tiptap.
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then((posts: Post[]) => {
        const post = posts.find(p => p.id === Number(params.id));
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          editor?.commands.setContent(post.content);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, editor]);

  const save = async () => {
    setLoading(true);
    await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(params.id), title, content }),
    });
    setLoading(false);
    router.push('/posts');
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">記事を編集</h1>
        <input
          className="w-full px-4 py-2 border border-border rounded-lg"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="タイトル"
        />
        <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-2">
          <EditorContent editor={editor} className="min-h-[300px]" />
        </div>
        <div className="prose max-w-none bg-card-bg p-4 rounded-lg border border-border" dangerouslySetInnerHTML={{ __html: content }} />
        <button
          className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          onClick={save}
          disabled={loading}
        >
          保存
        </button>
      </div>
    </div>
  );
}
