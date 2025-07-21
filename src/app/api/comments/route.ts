import { NextRequest, NextResponse } from 'next/server';
import { getComments, fetchCommentsFromBlogger } from '@/lib/comments';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get('refresh');
  const postIdParam = searchParams.get('postId');

  if (refresh) {
    const apiKey = process.env.BLOGGER_API_KEY || '';
    const blogId = process.env.BLOGGER_BLOG_ID || '';
    await fetchCommentsFromBlogger(apiKey, blogId);
  }

  const postId = postIdParam ? Number(postIdParam) : undefined;
  return NextResponse.json(getComments(postId));
}
