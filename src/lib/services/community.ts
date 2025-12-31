import { getClient } from '@/lib/supabase/client';
import type { Post, Comment, PostWithAuthor, CommentWithAuthor, PostType } from '@/types/database';

export async function getPosts(type?: PostType): Promise<PostWithAuthor[]> {
  const supabase = getClient();

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data.map((post: Post & { author: unknown }) => ({
    ...post,
    author: post.author as PostWithAuthor['author'],
  }));
}

export async function getPost(postId: string): Promise<PostWithAuthor | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return {
    ...data,
    author: data.author as PostWithAuthor['author'],
  };
}

export async function createPost(
  userId: string,
  type: PostType,
  title: string,
  content: string,
  image?: string,
  challengeId?: string
): Promise<Post | null> {
  const supabase = getClient();

  const postId = `post-${Date.now()}`;

  const { data, error } = await supabase
    .from('posts')
    .insert({
      id: postId,
      user_id: userId,
      type,
      title,
      content,
      image,
      challenge_id: challengeId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return data;
}

export async function getPostComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data.map((comment: Comment & { author: unknown }) => ({
    ...comment,
    author: comment.author as CommentWithAuthor['author'],
  }));
}

export async function createComment(
  userId: string,
  postId: string,
  content: string
): Promise<Comment | null> {
  const supabase = getClient();

  const commentId = `comment-${Date.now()}`;

  const { data, error } = await supabase
    .from('comments')
    .insert({
      id: commentId,
      post_id: postId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  // Update comment count on post
  await supabase.rpc('increment_comments_count', { post_id: postId });

  return data;
}

export async function likePost(userId: string, postId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('post_likes')
    .insert({
      user_id: userId,
      post_id: postId,
    });

  if (error) {
    // Already liked or other error
    return false;
  }

  // Update likes count
  await supabase.rpc('increment_likes_count', { post_id: postId });

  return true;
}

export async function unlikePost(userId: string, postId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) {
    return false;
  }

  // Update likes count
  await supabase.rpc('decrement_likes_count', { post_id: postId });

  return true;
}

export async function hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  return !error && !!data;
}
