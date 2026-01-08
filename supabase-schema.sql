-- =============================================
-- Ibadah Station Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Daily Wisdom (ข้อคิดเตือนใจประจำวัน)
-- =============================================
CREATE TABLE daily_wisdom (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning_th TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  source VARCHAR(255) NOT NULL, -- e.g., 'Quran', 'Hadith Bukhari'
  source_detail VARCHAR(255), -- e.g., 'Surah Al-Baqarah 2:286'
  is_active BOOLEAN DEFAULT true,
  display_date DATE, -- Specific date to show (NULL = random rotation)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data
INSERT INTO daily_wisdom (arabic, transliteration, meaning_th, meaning_en, source, source_detail) VALUES
('إِنَّ مَعَ الْعُسْرِ يُسْرًا', 'Inna ma''al usri yusra', 'แท้จริงพร้อมกับความยากลำบากนั้นมีความง่ายดาย', 'Indeed, with hardship comes ease', 'Quran', 'Surah Ash-Sharh 94:6'),
('وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', 'Wa man yattaqillaha yaj''al lahu makhraja', 'และผู้ใดที่ยำเกรงอัลลอฮ์ พระองค์จะทรงหาทางออกให้แก่เขา', 'And whoever fears Allah - He will make for him a way out', 'Quran', 'Surah At-Talaq 65:2'),
('خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'Khairukum man ta''allamal Qurana wa ''allamah', 'ผู้ที่ดีที่สุดในหมู่พวกท่าน คือผู้ที่เรียนอัลกุรอานและสอนมัน', 'The best among you are those who learn the Quran and teach it', 'Hadith', 'Sahih Bukhari'),
('الدُّعَاءُ هُوَ الْعِبَادَةُ', 'Ad-du''a huwal ''ibadah', 'การวิงวอน(ดุอา)คืออิบาดะฮ์', 'Supplication (Dua) is worship', 'Hadith', 'Sunan At-Tirmidhi'),
('إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', 'Innamal a''malu binniyyat', 'แท้จริงการงานทั้งหลายขึ้นอยู่กับเจตนา', 'Actions are judged by intentions', 'Hadith', 'Sahih Bukhari & Muslim'),
('مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا', 'Man salla ''alayya salatan sallallahu ''alayhi biha ''ashra', 'ผู้ใดที่กล่าวเศาะละวาตให้ฉันหนึ่งครั้ง อัลลอฮ์จะทรงประทานความเมตตาแก่เขาสิบเท่า', 'Whoever sends blessings upon me once, Allah will send blessings upon him tenfold', 'Hadith', 'Sahih Muslim');

-- =============================================
-- 2. Articles (บทความ)
-- =============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_th VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  excerpt_th TEXT,
  excerpt_en TEXT,
  content_th TEXT NOT NULL,
  content_en TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(50) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample articles
INSERT INTO articles (slug, title_th, title_en, excerpt_th, excerpt_en, content_th, content_en, category, tags, is_published, published_at) VALUES
('importance-of-salah', 'ความสำคัญของการละหมาด', 'The Importance of Salah', 'ละหมาดเป็นเสาหลักของศาสนาอิสลามและเป็นสิ่งแรกที่มนุษย์จะถูกถามในวันกิยามะฮ์', 'Salah is the pillar of Islam and the first thing a person will be questioned about on the Day of Judgment', '# ความสำคัญของการละหมาด\n\nละหมาดเป็นเสาหลักที่สำคัญที่สุดของอิสลาม...\n\n## หลักฐานจากอัลกุรอาน\n\nอัลลอฮ์ตรัสว่า...\n\n## ผลบุญของการละหมาด\n\n1. ลบล้างความผิด\n2. ใกล้ชิดอัลลอฮ์\n3. สร้างความสงบในจิตใจ', '# The Importance of Salah\n\nSalah is the most important pillar of Islam...\n\n## Evidence from Quran\n\nAllah says...\n\n## Benefits of Salah\n\n1. Erases sins\n2. Brings closer to Allah\n3. Creates peace in the heart', 'salah', ARRAY['salah', 'pillar', 'worship'], true, NOW()),
('preparing-for-umrah', 'เตรียมตัวไปอุมเราะฮ์', 'Preparing for Umrah', 'คู่มือเตรียมตัวก่อนเดินทางไปประกอบพิธีอุมเราะฮ์ ณ นครมักกะฮ์', 'A comprehensive guide to preparing for your Umrah journey to Makkah', '# เตรียมตัวไปอุมเราะฮ์\n\n## สิ่งที่ต้องเตรียม\n\n### เอกสาร\n- หนังสือเดินทาง\n- วีซ่า\n\n### ของใช้\n- ผ้าอิห์รอม\n- รองเท้าสำหรับเดิน', '# Preparing for Umrah\n\n## What to Prepare\n\n### Documents\n- Passport\n- Visa\n\n### Items\n- Ihram cloth\n- Walking shoes', 'umrah', ARRAY['umrah', 'preparation', 'travel'], true, NOW());

-- =============================================
-- 3. Page Views (สถิติการเข้าชม)
-- =============================================
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_hash VARCHAR(64), -- Hashed IP for privacy
  country VARCHAR(2),
  referrer TEXT,
  session_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_session ON page_views(session_id);

-- =============================================
-- 4. Admin Users (สำหรับจัดการ Admin)
-- =============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. Views & Functions
-- =============================================

-- Function to get today's wisdom
CREATE OR REPLACE FUNCTION get_todays_wisdom()
RETURNS TABLE (
  id UUID,
  arabic TEXT,
  transliteration TEXT,
  meaning_th TEXT,
  meaning_en TEXT,
  source VARCHAR,
  source_detail VARCHAR
) AS $$
BEGIN
  -- First try to get wisdom for today's specific date
  RETURN QUERY
  SELECT w.id, w.arabic, w.transliteration, w.meaning_th, w.meaning_en, w.source, w.source_detail
  FROM daily_wisdom w
  WHERE w.is_active = true AND w.display_date = CURRENT_DATE
  LIMIT 1;
  
  -- If none found, get random based on day of year
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT w.id, w.arabic, w.transliteration, w.meaning_th, w.meaning_en, w.source, w.source_detail
    FROM daily_wisdom w
    WHERE w.is_active = true AND w.display_date IS NULL
    ORDER BY (EXTRACT(DOY FROM CURRENT_DATE)::INT + w.id::TEXT::INT) % 
             (SELECT COUNT(*) FROM daily_wisdom WHERE is_active = true)
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily stats
CREATE OR REPLACE FUNCTION get_daily_stats(days_back INT DEFAULT 7)
RETURNS TABLE (
  date DATE,
  total_views BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pv.created_at) as date,
    COUNT(*) as total_views,
    COUNT(DISTINCT pv.session_id) as unique_visitors
  FROM page_views pv
  WHERE pv.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(pv.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE daily_wisdom ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Public read access for wisdom and published articles
CREATE POLICY "Public can read active wisdom" ON daily_wisdom
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (is_published = true);

-- Allow anonymous page view inserts
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Admin full access (you'll need to set up admin authentication)
CREATE POLICY "Admins can do everything on wisdom" ON daily_wisdom
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can do everything on articles" ON articles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read page views" ON page_views
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- 7. Triggers for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_wisdom_updated_at
  BEFORE UPDATE ON daily_wisdom
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. User Profiles (extends auth.users)
-- =============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  preferred_locale VARCHAR(2) DEFAULT 'th',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation on signup
CREATE POLICY "Enable insert for authenticated users only" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. Question Categories (Q&A)
-- =============================================
CREATE TABLE question_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO question_categories (slug, name_th, name_en, icon, sort_order) VALUES
('salah', 'การละหมาด', 'Prayer (Salah)', '🕌', 1),
('wudu', 'การอาบน้ำละหมาด', 'Ablution (Wudu)', '💧', 2),
('fasting', 'การถือศีลอด', 'Fasting', '🌙', 3),
('zakat', 'ซะกาต', 'Zakat', '💎', 4),
('hajj-umrah', 'ฮัจญ์/อุมเราะฮ์', 'Hajj/Umrah', '🕋', 5),
('general', 'ทั่วไป', 'General', '❓', 6);

-- Enable RLS
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read active categories" ON question_categories
  FOR SELECT USING (is_active = true);

-- =============================================
-- 10. Questions (Q&A)
-- =============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES question_categories(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, answered, closed
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Public can read answered questions
CREATE POLICY "Public can read answered questions" ON questions
  FOR SELECT USING (status = 'answered');

-- Users can read their own questions (any status)
CREATE POLICY "Users can read own questions" ON questions
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending questions
CREATE POLICY "Users can update own pending questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all questions
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
  );

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 11. Answers (Q&A - Admin Only)
-- =============================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id),
  content TEXT NOT NULL,
  sources TEXT[], -- References/sources
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Enable RLS
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Public can read answers
CREATE POLICY "Public can read answers" ON answers
  FOR SELECT USING (true);

-- Only admins can create/update answers
CREATE POLICY "Admins can manage answers" ON answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
  );

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update question status when answered
CREATE OR REPLACE FUNCTION update_question_status_on_answer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions SET status = 'answered', updated_at = NOW()
  WHERE id = NEW.question_id AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_answer_created
  AFTER INSERT ON answers
  FOR EACH ROW EXECUTE FUNCTION update_question_status_on_answer();
