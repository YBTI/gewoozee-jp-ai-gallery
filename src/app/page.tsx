'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/features/Header';
import PostForm from '@/components/features/PostForm';
import PostGrid from '@/components/features/PostGrid';
import CheetahIllustration from '@/components/ui/CheetahIllustration';
import { Post, Comment } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Initial Fetch from Supabase
  const fetchPosts = async () => {
    try {
      console.log('Fetching posts from Supabase...');
      const { data: postsData, error: fetchError } = await supabase
        .from('posts')
        .select('*, comments(*)')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        setError(`Fetch failed: ${fetchError.message}`);
        return;
      }

      if (!postsData) {
        setPosts([]);
        setIsLoaded(true);
        return;
      }

      // Map DB snake_case to frontend camelCase
      const formattedPosts = postsData.map((p: any) => ({
        ...p,
        fileUrl: p.file_url,
        fileName: p.file_name,
        thumbnailUrl: p.thumbnail_url,
        createdAt: p.created_at,
        comments: (p.comments || []).map((c: any) => ({
          ...c,
          postId: c.post_id,
          createdAt: c.created_at
        }))
      }));
      
      console.log('Fetched posts:', formattedPosts.length);
      setPosts(formattedPosts);
      setError(null);
    } catch (e: any) {
      console.error('Unexpected error during fetch:', e);
      setError(`Unexpected error: ${e.message}`);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time changes
    // Only works if Replication is enabled for the tables
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('Real-time post change detected:', payload.eventType);
        fetchPosts();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
        console.log('Real-time comment added:', payload);
        fetchPosts();
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddPost = async (newPost: Post) => {
    // Optimistic Update (Show it immediately while saving)
    const tempPost = { ...newPost, id: 'temp-' + Date.now() };
    setPosts([tempPost, ...posts]);

    const { error: insertError } = await supabase.from('posts').insert({
      title: newPost.title,
      url: newPost.url,
      file_url: newPost.fileUrl,
      file_name: newPost.fileName,
      thumbnail_url: newPost.thumbnailUrl,
      description: newPost.description,
      prompt: newPost.prompt,
      author: newPost.author,
      tags: newPost.tags,
    });

    if (insertError) {
      console.error('Error adding post:', insertError);
      alert('投稿に失敗しました: ' + insertError.message);
      // Rollback optimistic update on error
      fetchPosts();
    } else {
      // Real-time or manual fetch will clean up the temp post
      fetchPosts();
    }
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: updatedPost.title,
        url: updatedPost.url,
        file_url: updatedPost.fileUrl,
        file_name: updatedPost.fileName,
        thumbnail_url: updatedPost.thumbnailUrl,
        description: updatedPost.description,
        prompt: updatedPost.prompt,
        author: updatedPost.author,
        tags: updatedPost.tags,
      })
      .eq('id', updatedPost.id);

    if (updateError) {
      console.error('Error updating post:', updateError);
      alert('更新に失敗しました: ' + updateError.message);
    } else {
      setEditPost(null);
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      alert('削除に失敗しました: ' + deleteError.message);
    } else {
      fetchPosts();
    }
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    const { error: commentError } = await supabase.from('comments').insert({
      post_id: postId,
      author: comment.author,
      content: comment.content,
    });

    if (commentError) {
      console.error('Error adding comment:', commentError);
      alert('コメントの投稿に失敗しました');
    } else {
      fetchPosts();
    }
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Header />
      
      <div className="container">
        <section className="section" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '2rem' }}>
          <CheetahIllustration />
          <h2 className="gradient-text animate-fade-in" style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
            Showcase Your AI Innovations
          </h2>
          <p className="animate-fade-in" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            作成したアプリのURL、プロンプト、作品。AIで創り出した素晴らしい成果を世界に共有しましょう。
          </p>
          
          {error && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
              <p>⚠️ エラーが発生しました: {error}</p>
              <button onClick={() => fetchPosts()} className="btn-primary" style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>再試行</button>
            </div>
          )}

          {!isLoaded && !error && (
            <div style={{ marginTop: '3rem' }}>
              <div className="animate-pulse" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>ギャラリーを読み込み中...</div>
            </div>
          )}
        </section>

        <PostForm 
          onAddPost={handleAddPost} 
          onUpdatePost={handleUpdatePost}
          editPost={editPost}
          onCancelEdit={() => setEditPost(null)}
        />
        
        {isLoaded && <PostGrid 
          posts={posts} 
          onAddComment={handleAddComment} 
          onEditPost={setEditPost}
          onDeletePost={handleDeletePost}
        />}
      </div>

      <footer className="glass" style={{ marginTop: '6rem', padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; 2026 Gewoozee JP AI Gallery. Built for the AI creative community.
        </p>
      </footer>
    </main>
  );
}
