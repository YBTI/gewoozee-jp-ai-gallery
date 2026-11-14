// コンテンツのジャンル定義
// ジャンルを追加・変更したい場合はここを編集してください。
// color はカードの光彩・バッジ・絞り込みボタンの色に使われます。
export const GENRES = [
  { id: 'app', label: 'アプリ・Webサービス', icon: '🧩', color: '#8b5cf6' },
  { id: 'game', label: 'ゲーム', icon: '🎮', color: '#22c55e' },
  { id: 'image', label: '画像・イラスト', icon: '🎨', color: '#ec4899' },
  { id: 'video', label: '動画', icon: '🎬', color: '#ef4444' },
  { id: 'music', label: '音楽・音声', icon: '🎵', color: '#f59e0b' },
  { id: 'text', label: '文章・小説', icon: '📝', color: '#3b82f6' },
  { id: 'prompt', label: 'プロンプト', icon: '💡', color: '#06b6d4' },
  { id: 'other', label: 'その他', icon: '📦', color: '#a1a1aa' },
] as const;

export type GenreId = (typeof GENRES)[number]['id'];

export const DEFAULT_GENRE: GenreId = 'other';

export const getGenre = (id?: string | null) =>
  GENRES.find(g => g.id === id) ?? GENRES.find(g => g.id === DEFAULT_GENRE)!;
