// コンテンツのジャンル定義
// ジャンルを追加・変更したい場合はここを編集してください。
export const GENRES = [
  { id: 'app', label: 'アプリ・Webサービス', icon: '🧩' },
  { id: 'image', label: '画像・イラスト', icon: '🎨' },
  { id: 'video', label: '動画', icon: '🎬' },
  { id: 'music', label: '音楽・音声', icon: '🎵' },
  { id: 'text', label: '文章・小説', icon: '📝' },
  { id: 'prompt', label: 'プロンプト', icon: '💡' },
  { id: 'other', label: 'その他', icon: '📦' },
] as const;

export type GenreId = (typeof GENRES)[number]['id'];

export const DEFAULT_GENRE: GenreId = 'other';

export const getGenre = (id?: string | null) =>
  GENRES.find(g => g.id === id) ?? GENRES.find(g => g.id === DEFAULT_GENRE)!;
