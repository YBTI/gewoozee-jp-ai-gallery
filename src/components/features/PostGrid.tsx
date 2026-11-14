'use client';

import React from 'react';
import { Post, Comment } from '@/types';
import PostCard from './PostCard';
import Reveal from '@/components/ui/Reveal';

interface PostGridProps {
  posts: Post[];
  onAddComment: (postId: string, comment: Comment) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onLikePost: (postId: string) => void;
  emptyMessage?: string;
}

export default function PostGrid({ posts, onAddComment, onEditPost, onDeletePost, onLikePost, emptyMessage }: PostGridProps) {
  return (
    <div 
      className="section"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', 
        gap: '2rem',
        paddingTop: '2.5rem'
      }}
    >
      {posts.length > 0 ? (
        posts.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 90}>
          <PostCard 
            key={post.id} 
            post={post} 
            onAddComment={onAddComment} 
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onLikePost={onLikePost}
          />
          </Reveal>
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>{emptyMessage || '投稿がまだありません。最初のAI作品を投稿しましょう！'}</p>
        </div>
      )}
    </div>
  );
}
