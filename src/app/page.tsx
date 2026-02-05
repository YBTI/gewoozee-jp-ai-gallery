'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/features/Header';
import PostForm from '@/components/features/PostForm';
import PostGrid from '@/components/features/PostGrid';
import CheetahIllustration from '@/components/ui/CheetahIllustration';
import { Post, Comment } from '@/types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('gewoozee_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        console.error("Failed to parse posts from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gewoozee_posts', JSON.stringify(posts));
    }
  }, [posts, isLoaded]);

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setEditPost(null);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleAddComment = (postId: string, comment: Comment) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
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
