-- Enable the uuid-ossp for uuid_generate_v4() support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Posts table (will not overwrite if exists)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  url TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  thumbnail_url TEXT,
  description TEXT,
  prompt TEXT,
  author TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safe way to add 'likes' column to an existing table WITHOUT losing data
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='likes') THEN
        ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Posts" ON posts;
    DROP POLICY IF EXISTS "Public Insert Posts" ON posts;
    DROP POLICY IF EXISTS "Public Update Posts" ON posts;
    DROP POLICY IF EXISTS "Public Delete Posts" ON posts;
    DROP POLICY IF EXISTS "Public Read Comments" ON comments;
    DROP POLICY IF EXISTS "Public Insert Comments" ON comments;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Insert Posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Public Delete Posts" ON posts FOR DELETE USING (true);

CREATE POLICY "Public Read Comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Comments" ON comments FOR INSERT WITH CHECK (true);

-- 5. Enable Realtime Replication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- 6. RPC for atomic likes increment
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
