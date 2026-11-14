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
    { id: 'all', label: 'すべて', icon: '✨', color: '#8b5cf6', count: total },
    ...GENRES.map(g => ({ ...g, count: counts[g.id] || 0 })),
  ];

  return (
    <nav aria-label="ジャンルで絞り込み" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
      {items.map(item => {
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={`genre-chip${active ? ' is-active' : ''}`}
            style={{ '--c': item.color } as React.CSSProperties}
          >
            <span className="genre-chip-icon">{item.icon}</span>
            <span>{item.label}</span>
            <span className="genre-chip-count">{item.count}</span>
          </button>
        );
      })}
    </nav>
  );
}
