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
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Initial Fetch from Supabase
  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      // Map DB snake_case to frontend camelCase if necessary
      // Supabase returns camelCase if using the JS client and the table is setup correctly, 
      // but let's be safe and map if needed.
      const formattedPosts = postsData.map((p: any) => ({
        ...p,
        fileUrl: p.file_url,
        fileName: p.file_name,
        thumbnailUrl: p.thumbnail_url,
        createdAt: p.created_at,
        comments: p.comments.map((c: any) => ({
          ...c,
          postId: c.post_id,
          createdAt: c.created_at
        }))
      }));
      setPosts(formattedPosts);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddPost = async (newPost: Post) => {
    const { error } = await supabase.from('posts').insert({
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

    if (error) console.error('Error adding post:', error);
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    const { error } = await supabase
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

    if (error) {
      console.error('Error updating post:', error);
    } else {
      setEditPost(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) console.error('Error deleting post:', error);
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author: comment.author,
      content: comment.content,
    });

    if (error) console.error('Error adding comment:', error);
  };

  return (
    <main style={{ minHeight: '100vh' }}>
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
          {!isLoaded && <p style={{ marginTop: '2rem' }}>Loading global gallery...</p>}
        </section>

        <PostForm 
          onAddPost={handleAddPost} 
          onUpdatePost={handleUpdatePost}
          editPost={editPost}
          onCancelEdit={() => setEditPost(null)}
        />
        
        <PostGrid 
          posts={posts} 
          onAddComment={handleAddComment} 
          onEditPost={setEditPost}
          onDeletePost={handleDeletePost}
        />
      </div>

      <footer className="glass" style={{ marginTop: '4rem', padding: '2rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; 2026 Gewoozee JP AI Gallery. Built for the AI creative community.
        </p>
      </footer>
    </main>
  );
}
