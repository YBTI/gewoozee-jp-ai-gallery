-- 1. Create Posts table
CREATE TABLE posts (
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

-- 2. Create Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Public Read/Write for demo purposes)
-- NOTE: In a production app, you would restrict Write/Delete to authenticated users.
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Insert Posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Public Delete Posts" ON posts FOR DELETE USING (true);

CREATE POLICY "Public Read Comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Comments" ON comments FOR INSERT WITH CHECK (true);

-- 5. Set up Storage for Gallery Assets
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

CREATE POLICY "Public Access Storage" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Upload Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery');
CREATE POLICY "Public Delete Storage" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
