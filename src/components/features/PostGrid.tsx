'use client';

import React from 'react';
import { Post, Comment } from '@/types';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Post[];
  onAddComment: (postId: string, comment: Comment) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onLikePost: (postId: string) => void;
}

export default function PostGrid({ posts, onAddComment, onEditPost, onDeletePost, onLikePost }: PostGridProps) {
  return (
    <div 
      className="section"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '2rem' 
      }}
    >
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onAddComment={onAddComment} 
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onLikePost={onLikePost}
          />
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>投稿がまだありません。最初のAI作品を投稿しましょう！</p>
        </div>
      )}
    </div>
  );
}
