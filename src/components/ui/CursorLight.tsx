'use client';

import React, { useEffect, useRef, useState } from 'react';

// 背景を照らすカーソルライトと、光が当たると浮かび上がる隠しイラスト
const HIDDEN_IMAGE = '/hidden-tiger.png';
const HIDDEN_COUNT = 10;   // 隠しイラストの数
const LIT_RADIUS = 130;    // この距離(px)まで近づくとイラストが反応する

interface HiddenItem {
  id: number;
  left: number;  // %
  top: number;   // %
  width: number; // px
  rot: number;   // deg
  flip: 1 | -1;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function CursorLight() {
  const layerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [items, setItems] = useState<HiddenItem[]>([]);

  // ランダム配置はブラウザ側で決める（表示のたびに場所が変わる）
  useEffect(() => {
    setItems(
      Array.from({ length: HIDDEN_COUNT }, (_, i) => ({
        id: i,
        left: rand(1, 90),
        top: ((i + rand(0.1, 0.9)) / HIDDEN_COUNT) * 96, // 縦方向にまんべんなく散らす
        width: Math.round(rand(90, 170)),
        rot: rand(-18, 18),
        flip: Math.random() < 0.5 ? 1 : -1,
      }))
    );
  }, []);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let active = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const layer = layerRef.current;
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      layer.style.setProperty('--x', `${lastX - rect.left}px`);
      layer.style.setProperty('--y', `${lastY - rect.top}px`);
      layer.classList.toggle('is-active', active);

      imgRefs.current.forEach(img => {
        if (!img) return;
        const r = img.getBoundingClientRect();
        const dx = r.left + r.width / 2 - lastX;
        const dy = r.top + r.height / 2 - lastY;
        img.classList.toggle('is-lit', active && Math.hypot(dx, dy) < LIT_RADIUS + r.width / 3);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lastX = e.clientX;
      lastY = e.clientY;
      active = true;
      schedule();
    };

    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        active = false;
        schedule();
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('mouseout', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={layerRef} className="cursor-light-layer" aria-hidden>
      <div className="cursor-light" />
      <div className="hidden-art">
        {items.map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            ref={el => { imgRefs.current[i] = el; }}
            src={HIDDEN_IMAGE}
            alt=""
            draggable={false}
            className="hidden-tiger"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: `${item.width}px`,
              '--rot': `${item.rot}deg`,
              '--flip': item.flip,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
