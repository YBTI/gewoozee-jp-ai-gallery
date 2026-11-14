'use client';

import React, { useState, useRef } from 'react';
import { Post, Comment } from '@/types';
import { getGenre } from '@/lib/genres';

interface PostCardProps {
  post: Post;
  onAddComment: (postId: string, comment: Comment) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onLikePost: (postId: string) => void;
}

const NEW_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3日以内の投稿に NEW バッジ

export default function PostCard({ post, onAddComment, onEditPost, onDeletePost, onLikePost }: PostCardProps) {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);
  const [popping, setPopping] = useState(false);

  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const genre = getGenre(post.genre);
  const isNew = Date.now() - new Date(post.createdAt).getTime() < NEW_THRESHOLD_MS;

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

  const isVideo = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) || url.includes('/uploads/') && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youTubeId = getYouTubeId(post.url);
  const hasVideo = post.thumbnailUrl === 'video-placeholder' || isVideo(post.fileUrl || '');

  // マウスに合わせてカードを立体的に傾け、光を追従させる
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const s = cardRef.current.style;
    s.setProperty('--rx', `${(0.5 - y) * 6}deg`);
    s.setProperty('--ry', `${(x - 0.5) * 8}deg`);
    s.setProperty('--mx', `${x * 100}%`);
    s.setProperty('--my', `${y * 100}%`);
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    const s = cardRef.current.style;
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');
  };

  const handleMediaEnter = () => {
    videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
  };

  const handleMediaLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleLike = () => {
    onLikePost(post.id);
    const id = Date.now() + Math.random();
    setBursts(b => [...b, id]);
    setTimeout(() => setBursts(b => b.filter(x => x !== id)), 900);
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  };

  return (
    <article
      ref={cardRef}
      className="post-card"
      style={{ '--c': genre.color } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Eye-catch / Thumbnail */}
      {post.thumbnailUrl ? (
        <div className="post-media" onMouseEnter={handleMediaEnter} onMouseLeave={handleMediaLeave}>
          {hasVideo ? (
            <video
              ref={videoRef}
              src={post.fileUrl}
              muted
              playsInline
              loop
              poster={post.thumbnailUrl !== 'video-placeholder' ? post.thumbnailUrl : undefined}
            />
          ) : youTubeId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=0&mute=1&controls=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ pointerEvents: 'none' }}
            ></iframe>
          ) : (
            <img src={post.thumbnailUrl} alt={post.title || 'Thumbnail'} />
          )}

          {(hasVideo || youTubeId) && <div className="media-chip">▶ VIDEO</div>}
          <span className="genre-badge">{genre.icon} {genre.label}</span>
          {isNew && <span className="new-badge">NEW</span>}
        </div>
      ) : (
        <div className="post-media post-placeholder">
          <span className="placeholder-icon">{genre.icon}</span>
          <span className="genre-badge">{genre.icon} {genre.label}</span>
          {isNew && <span className="new-badge">NEW</span>}
        </div>
      )}

      <div className="post-body">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 className="post-title">{post.title || '無題の作品'}</h3>
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
              <button onClick={() => onEditPost(post)} className="icon-btn" title="編集">✏️</button>
              <button
                onClick={() => { if (confirm('削除してもよろしいですか？')) onDeletePost(post.id); }}
                className="icon-btn"
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--c)', fontWeight: 600 }}>by {post.author || '匿名さん'}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {new Date(post.createdAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </header>

        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {post.tags.map(tag => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {post.description && (
            <p style={{ fontSize: '0.92rem', whiteSpace: 'pre-wrap', color: '#d4d4d8' }}>{post.description}</p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="open-btn">
            作品を見る <span aria-hidden>→</span>
          </a>
          <button
            onClick={handleLike}
            className={`like-button${popping ? ' is-popping' : ''}`}
            onAnimationEnd={() => setPopping(false)}
            aria-label="いいね"
          >
            <span>❤️</span>
            <span style={{ fontWeight: 700 }}>{post.likes || 0}</span>
            {bursts.map(id => (
              <span key={id} className="like-burst" aria-hidden>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="heart-particle" style={{ '--i': i } as React.CSSProperties}>❤</span>
                ))}
              </span>
            ))}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="ghost-btn"
            aria-expanded={showComments}
          >
            💬 {post.comments.length}
          </button>
        </div>

        {post.prompt && (
          <div>
            <button onClick={() => setShowPrompt(!showPrompt)} className="ghost-btn" style={{ fontSize: '0.8rem' }}>
              {showPrompt ? 'プロンプトを隠す' : '💡 プロンプトを表示'}
            </button>
            {showPrompt && (
              <pre className="prompt-box animate-fade-in">
                <code>{post.prompt}</code>
              </pre>
            )}
          </div>
        )}

        {showComments && (
          <section className="animate-fade-in" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>コメント ({post.comments.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem' }}>
              {post.comments.map(comment => (
                <div key={comment.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--c)' }}>{comment.author}</span>
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
                className="comment-input"
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="コメントを入力..."
                  required
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="comment-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="send-btn">送信</button>
              </div>
            </form>
          </section>
        )}
      </div>
    </article>
  );
}
