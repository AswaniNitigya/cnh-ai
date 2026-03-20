-- College Notice Hub (CNH) Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'faculty', 'cr', 'student')),
  course TEXT,
  branch TEXT,
  year_of_grad INTEGER,
  dept TEXT,
  section TEXT,
  phone TEXT,
  is_cr BOOLEAN DEFAULT false,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_approval')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('academic', 'exam', 'event', 'placement', 'general')),
  original_image_url TEXT,
  pdf_url TEXT,
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ocr', 'scraper')),
  target_criteria JSONB DEFAULT '{"global": true}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped logs table for deduplication
CREATE TABLE IF NOT EXISTS scraped_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  title TEXT,
  date_found TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_posted_by ON notices(posted_by);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scraped_logs_hash ON scraped_logs(content_hash);

-- Enable Row Level Security (but allow all for now via service role)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public access via anon key (our backend handles auth)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notices" ON notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on scraped_logs" ON scraped_logs FOR ALL USING (true) WITH CHECK (true);
