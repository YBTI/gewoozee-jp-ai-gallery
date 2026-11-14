export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title?: string;
  url: string; // URL is the only mandatory field
  fileUrl?: string;
  fileName?: string;
  thumbnailUrl?: string;
  description?: string;
  prompt?: string;
  author?: string;
  tags?: string[];
  genre?: string; // GENRES の id (src/lib/genres.ts)
  likes?: number;
  createdAt: string;
  comments: Comment[];
}
