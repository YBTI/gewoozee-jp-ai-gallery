'use client';

import React, { useState, useEffect } from 'react';
import { Post } from '@/types';
import { supabase } from '@/lib/supabase';

interface PostFormProps {
  onAddPost: (post: Post) => void;
  onUpdatePost: (post: Post) => void;
  editPost?: Post | null;
  onCancelEdit: () => void;
}

export default function PostForm({ onAddPost, onUpdatePost, editPost, onCancelEdit }: PostFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    prompt: '',
    author: '',
    fileName: '',
    thumbnailUrl: '',
    fileUrl: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editPost) {
      setFormData({
        title: editPost.title || '',
        url: editPost.url,
        description: editPost.description || '',
        prompt: editPost.prompt || '',
        author: editPost.author || '',
        fileName: editPost.fileName || '',
        thumbnailUrl: editPost.thumbnailUrl || '',
        fileUrl: editPost.fileUrl || '',
      });
      setTags(editPost.tags || []);
      setIsOpen(true);
    }
  }, [editPost]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    setFormData(prev => ({ 
      ...prev, 
      fileName: file.name,
      fileUrl: publicUrl,
      thumbnailUrl: file.type.startsWith('image/') ? publicUrl : 'video-placeholder'
    }));
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url || uploading) return;

    if (editPost) {
      onUpdatePost({
        ...editPost,
        ...formData,
        tags: tags.length > 0 ? tags : undefined,
      });
    } else {
      // Mock ID for client-side state, DB will use UUID
      const newPost: Post = {
        id: '', // Will be assigned by Supabase
        ...formData,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: new Date().toISOString(),
        comments: [],
      };
      onAddPost(newPost);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', description: '', prompt: '', author: '', fileName: '', thumbnailUrl: '', fileUrl: '' });
    setTags([]);
    setTagInput('');
    setIsOpen(false);
    onCancelEdit();
  };

  return (
    <div className="section" style={{ paddingBottom: '2rem' }}>
      {!isOpen ? (
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={() => setIsOpen(true)}>
            + AIギャラリーに投稿する
          </button>
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          className="glass-card animate-fade-in"
          style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}
        >
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{editPost ? '投稿を編集' : '新規投稿'}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600 }}>
              URL (必須)
              <input 
                type="url" 
                required
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(139, 92, 246, 0.1)', color: 'white', marginTop: '0.4rem' }}
                placeholder="https://..."
              />
            </label>

            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              タイトル
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.4rem' }}
                placeholder="アプリ名や作品名"
              />
            </label>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              AIタグ (複数可)
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  placeholder="例: GPT-4, Midjourney, Claude"
                />
                <button type="button" onClick={handleAddTag} className="btn-primary" style={{ padding: '0 1rem' }}>追加</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {tags.map(tag => (
                  <span key={tag} className="glass" style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              説明
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.4rem', minHeight: '80px', resize: 'vertical' }}
                placeholder="このアプリ/作品について説明してください"
              />
            </label>

            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              使用したプロンプト
              <textarea 
                value={formData.prompt}
                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.4rem', minHeight: '80px', resize: 'vertical', fontFamily: 'monospace' }}
                placeholder="プロンプトを記入"
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem' }}>
               <label style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ニックネーム
                <input 
                  type="text" 
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.4rem' }}
                  placeholder="名無しさん"
                />
              </label>
              <label style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                画像/動画アップロード {uploading && '(収集中...)'}
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ width: '100%', padding: '0.5rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}
                />
                {formData.fileUrl && (
                  <div style={{ marginTop: '0.5rem', borderRadius: '4px', overflow: 'hidden', width: '100px', height: '60px', background: '#000' }}>
                    {formData.thumbnailUrl === 'video-placeholder' ? (
                      <video src={formData.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    ) : (
                      <img src={formData.thumbnailUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                )}
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1 }}>
                {uploading ? 'アップロード中...' : (editPost ? '更新する' : '投稿する')}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                disabled={uploading}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
