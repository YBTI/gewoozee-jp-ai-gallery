'use client';

import React, { useState } from 'react';
import { Post, Comment } from '@/types';

interface PostCardProps {
  post: Post;
  onAddComment: (postId: string, comment: Comment) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onLikePost: (postId: string) => void;
}

export default function PostCard({ post, onAddComment, onEditPost, onDeletePost, onLikePost }: PostCardProps) {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId: post.id,
      author: authorName,
      content: commentText,
      createdAt: new Date().toISOString(),
    };

    onAddComment(post.id, newComment);
    setCommentText('');
  };

  return (
    <article className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Eye-catch / Thumbnail */}
      {post.thumbnailUrl && (
        <div style={{ width: '100%', height: '180px', position: 'relative', background: '#000' }}>
          {post.thumbnailUrl === 'video-placeholder' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.2)' }}>
              <span style={{ fontSize: '3rem' }}>🎬</span>
            </div>
          ) : (
            <img 
              src={post.thumbnailUrl} 
              alt={post.title || 'Thumbnail'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          )}
        </div>
      )}

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>{post.title || '無題の作品'}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => onEditPost(post)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                title="編集"
              >
                ✏️
              </button>
              <button 
                onClick={() => { if(confirm('削除してもよろしいですか？')) onDeletePost(post.id) }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>by {post.author || '匿名さん'}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {new Date(post.createdAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </header>

        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {post.tags.map(tag => (
              <span key={tag} className="glass" style={{ padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {post.description && (
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{post.description}</p>
          )}
          
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ display: 'inline-block', fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem', textDecoration: 'underline' }}
          >
            📎 アプリ/作品を見る
          </a>

          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            onClick={() => onLikePost(post.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: 'rgba(236, 72, 153, 0.1)', 
              border: '1px solid rgba(236, 72, 153, 0.2)', 
              color: '#ec4899', 
              padding: '0.3rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="like-button"
          >
            <span>❤️</span>
            <span style={{ fontWeight: 600 }}>{post.likes || 0}</span>
          </button>
        </div>

        {post.prompt && (
          <div>
            <button 
              onClick={() => setShowPrompt(!showPrompt)}
              style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showPrompt ? 'プロンプトを隠す' : 'プロンプトを表示'}
            </button>
            {showPrompt && (
              <pre style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid var(--glass-border)', color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
                <code>{post.prompt}</code>
              </pre>
            )}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }} />

        <section>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>コメント ({post.comments.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
            {post.comments.map(comment => (
              <div key={comment.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{comment.author}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{comment.content}</p>
              </div>
            ))}
            {post.comments.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>まだコメントはありません</p>}
          </div>

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="名前" 
              required
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="コメントを入力..." 
                required
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem' }}
              />
              <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>
                送信
              </button>
            </div>
          </form>
        </section>
      </div>
    </article>
  );
}
