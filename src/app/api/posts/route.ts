import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost, updatePost, deletePost, fetchFromBlogger } from '@/lib/posts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get('refresh');
  if (refresh) {
    const apiKey = process.env.BLOGGER_API_KEY || '';
    const blogId = process.env.BLOGGER_BLOG_ID || '';
    const fetchAll = searchParams.get('fetchAll') === '1';
    const posts = await fetchFromBlogger(apiKey, blogId, fetchAll);
    return NextResponse.json(posts);
  }
  return NextResponse.json(getAllPosts());
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const post = createPost(data);
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const post = updatePost(data);
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  deletePost(id);
  return NextResponse.json({});
}
