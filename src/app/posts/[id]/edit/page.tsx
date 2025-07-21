'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const buttonClass = (active: boolean) =>
    `px-2 py-1 rounded border border-border text-sm ${active ? 'bg-primary text-white' : ''}`;
  return (
    <div className="flex gap-2 mb-2 border-b border-border pb-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={buttonClass(editor.isActive('paragraph'))}
      >
        P
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
      >
        H2
      </button>
    </div>
  );
}

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
  const [useRich, setUseRich] = useState(true);

  const formatHtml = (html: string) => html.replace(/<\/p><p/g, '</p>\n<p');
  const unformatHtml = (html: string) => html.replace(/<\/p>\n<p/g, '</p><p');

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    // Avoid hydration mismatches when this component is rendered on the server
    // by explicitly disabling immediate rendering as recommended by Tiptap.
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(formatHtml(editor.getHTML()));
    },
  });

  useEffect(() => {
    if (useRich && editor) {
      editor.commands.setContent(unformatHtml(content));
    }
    // We intentionally omit `content` from deps to avoid an update loop when
    // typing in the rich editor.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRich, editor]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then((posts: Post[]) => {
        const post = posts.find(p => p.id === Number(params.id));
        if (post) {
          setTitle(post.title);
          setContent(formatHtml(post.content));
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
      body: JSON.stringify({ id: Number(params.id), title, content: unformatHtml(content) }),
    });
    setLoading(false);
    router.push('/posts');
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">記事を編集</h1>
        <input
          className="w-full px-4 py-2 border border-border rounded-lg"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="タイトル"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUseRich(true)}
            className={`px-3 py-1 rounded-lg border border-border text-sm ${useRich ? 'bg-primary text-white' : 'bg-background'}`}
          >
            リッチエディタ
          </button>
          <button
            type="button"
            onClick={() => setUseRich(false)}
            className={`px-3 py-1 rounded-lg border border-border text-sm ${!useRich ? 'bg-primary text-white' : 'bg-background'}`}
          >
            HTMLエディタ
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-2">
            {useRich ? (
              <>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="min-h-[700px]" />
              </>
            ) : (
              <textarea
                className="w-full min-h-[700px] p-2 bg-background border border-border rounded-lg"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            )}
          </div>
          <div className="prose max-w-none bg-card-bg p-4 rounded-lg border border-border">
            <h2 className="mt-0">{title}</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
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
