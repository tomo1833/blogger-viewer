'use client';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  published: string;
}

interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  published: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    posts.forEach(p => {
      fetch(`/api/comments?postId=${p.id}`)
        .then(res => res.json())
        .then(data =>
          setComments(prev => ({ ...prev, [p.id]: data as Comment[] }))
        );
    });
  }, [posts]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts?refresh=1');
      const data = await res.json();
      setPosts(data);
      await fetch('/api/comments?refresh=1');
      setComments({});
    } finally {
      setIsLoading(false);
    }
  };

  const fullRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts?refresh=1&fetchAll=1');
      const data = await res.json();
      setPosts(data);
      await fetch('/api/comments?refresh=1');
      setComments({});
    } finally {
      setIsLoading(false);
    }
  };

  const create = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      setPosts(prev => [data, ...prev]);
      setTitle('');
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('本当にこの記事を削除しますか？')) return;
    
    try {
      await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const togglePost = (id: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPosts(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ブログ記事
          </h1>
          <p className="text-lg text-muted-foreground">スタイリッシュにブログコンテンツを管理</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                新しい記事を作成
              </h2>
              <div className="space-y-4">
                <input
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="記事のタイトルを入力..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
                  placeholder="記事の内容を入力..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button 
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={create}
                  disabled={isLoading || !title.trim() || !content.trim()}
                >
                  {isLoading ? '作成中...' : '記事を作成'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                同期オプション
              </h3>
              <div className="space-y-3">
                <button 
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  {isLoading ? '同期中...' : 'クイック同期'}
                </button>
                <button
                  className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                  onClick={fullRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? '同期中...' : '完全同期'}
                </button>
              </div>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">統計</h3>
              <div className="text-3xl font-bold text-primary">{posts.length}</div>
              <div className="text-sm text-muted-foreground">総記事数</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">記事を読み込み中...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-card-bg/80 backdrop-blur-sm border border-border rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">記事が見つかりません</h3>
              <p className="text-muted-foreground">最初の記事を作成するか、Bloggerから同期して始めましょう。</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post.id} 
                   className="bg-card-bg/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                   style={{animationDelay: `${index * 0.1}s`}}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors duration-200" 
                          onClick={() => togglePost(post.id)}>
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(post.published)}
                        </span>
                        {comments[post.id] && comments[post.id].length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {comments[post.id].length} コメント
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="ml-4 px-3 py-1 text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-200 flex items-center gap-1"
                      onClick={() => remove(post.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </div>

                  <div className={`prose prose-sm max-w-none transition-all duration-300 ${
                    expandedPosts.has(post.id) ? 'max-h-none' : 'max-h-32 overflow-hidden'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} className="text-foreground" />
                  </div>
                  
                  {!expandedPosts.has(post.id) && (
                    <button 
                      className="mt-3 text-primary hover:text-primary-dark font-medium text-sm transition-colors duration-200"
                      onClick={() => togglePost(post.id)}
                    >
                      続きを読む...
                    </button>
                  )}

                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        コメント ({comments[post.id].length})
                      </h4>
                      <div className="space-y-3">
                        {comments[post.id].map(comment => (
                          <div key={comment.id} className="bg-background/50 rounded-xl p-4 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-primary">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(comment.published)}</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: comment.content }} className="text-sm text-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
