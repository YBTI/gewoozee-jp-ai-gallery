'use client';

import React from 'react';
import { GENRES } from '@/lib/genres';

interface GenreFilterProps {
  selected: string; // 'all' or a genre id
  counts: Record<string, number>;
  total: number;
  onSelect: (genre: string) => void;
}

export default function GenreFilter({ selected, counts, total, onSelect }: GenreFilterProps) {
  const items = [
    { id: 'all', label: 'すべて', icon: '✨', count: total },
    ...GENRES.map(g => ({ ...g, count: counts[g.id] || 0 })),
  ];

  return (
    <nav aria-label="ジャンルで絞り込み" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
      {items.map(item => {
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={active ? undefined : 'glass'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              color: active ? 'white' : 'var(--text-muted)',
              background: active ? 'linear-gradient(135deg, var(--primary), var(--primary-glow))' : undefined,
              border: active ? '1px solid transparent' : undefined,
              boxShadow: active ? '0 4px 16px rgba(139, 92, 246, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({item.count})</span>
          </button>
        );
      })}
    </nav>
  );
}
