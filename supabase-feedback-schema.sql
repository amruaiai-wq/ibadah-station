-- ======================================
-- Content Feedback & Error Report System
-- ======================================
-- Purpose: Allow users to report errors or provide feedback on content
-- Use Cases:
--   - Report incorrect Arabic text, translation errors
--   - Report broken links or missing content
--   - Suggest improvements to journey steps
--   - Report quiz answer errors
-- ======================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- 1. Feedback Categories (ประเภทการรายงาน)
-- ======================================
CREATE TABLE IF NOT EXISTS public.feedback_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT, -- emoji or icon name
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.feedback_categories (slug, name_th, name_en, icon, sort_order) VALUES
    ('incorrect_arabic', 'ข้อความอาหรับผิด', 'Incorrect Arabic Text', '📝', 1),
    ('incorrect_translation', 'คำแปลผิด', 'Incorrect Translation', '🔤', 2),
    ('incorrect_info', 'ข้อมูลไม่ถูกต้อง', 'Incorrect Information', '❌', 3),
    ('broken_link', 'ลิงก์เสีย', 'Broken Link', '🔗', 4),
    ('missing_content', 'เนื้อหาขาดหาย', 'Missing Content', '📭', 5),
    ('suggestion', 'ข้อเสนอแนะ', 'Suggestion', '💡', 6),
    ('other', 'อื่นๆ', 'Other', '📌', 99)
ON CONFLICT (slug) DO NOTHING;

-- ======================================
-- 2. Content Feedback (รายงานข้อผิดพลาด)
-- ======================================
CREATE TABLE IF NOT EXISTS public.content_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User info (optional - allows anonymous feedback)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT, -- for anonymous users who want follow-up

    -- Content location
    page_type TEXT NOT NULL, -- 'journey', 'article', 'quiz', 'wisdom', 'qna', 'other'
    page_path TEXT NOT NULL, -- full path like '/th/journey/salah'
    page_title TEXT, -- title of the page for reference
    content_id TEXT, -- ID of specific content (step number, quiz ID, etc.)
    content_excerpt TEXT, -- excerpt of the problematic content

    -- Feedback details
    category_id UUID REFERENCES public.feedback_categories(id) ON DELETE SET NULL,
    category_slug TEXT, -- denormalized for quick access
    subject TEXT NOT NULL, -- short subject/title
    description TEXT NOT NULL, -- detailed description
    suggested_correction TEXT, -- user's suggested fix

    -- Metadata
    user_agent TEXT,
    locale TEXT DEFAULT 'th', -- th or en
    screenshot_url TEXT, -- optional screenshot upload

    -- Admin handling
    status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
    admin_note TEXT, -- admin's internal note
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_feedback_user_id ON public.content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_status ON public.content_feedback(status);
CREATE INDEX IF NOT EXISTS idx_content_feedback_page_type ON public.content_feedback(page_type);
CREATE INDEX IF NOT EXISTS idx_content_feedback_category ON public.content_feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_created_at ON public.content_feedback(created_at DESC);

-- ======================================
-- 3. Row Level Security (RLS)
-- ======================================
ALTER TABLE public.feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_feedback ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
DROP POLICY IF EXISTS "Anyone can read feedback categories" ON public.feedback_categories;
CREATE POLICY "Anyone can read feedback categories"
    ON public.feedback_categories
    FOR SELECT
    USING (true);

-- Feedback: Anyone can submit (allows anonymous feedback)
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.content_feedback;
CREATE POLICY "Anyone can submit feedback"
    ON public.content_feedback
    FOR INSERT
    WITH CHECK (true);

-- Feedback: Users can read their own feedback
DROP POLICY IF EXISTS "Users can read own feedback" ON public.content_feedback;
CREATE POLICY "Users can read own feedback"
    ON public.content_feedback
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true))
    );

-- Feedback: Admins can read all feedback
DROP POLICY IF EXISTS "Admins can read all feedback" ON public.content_feedback;
CREATE POLICY "Admins can read all feedback"
    ON public.content_feedback
    FOR SELECT
    USING (
        auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
    );

-- Feedback: Admins can update feedback (change status, add notes)
DROP POLICY IF EXISTS "Admins can update feedback" ON public.content_feedback;
CREATE POLICY "Admins can update feedback"
    ON public.content_feedback
    FOR UPDATE
    USING (
        auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
    )
    WITH CHECK (
        auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
    );

-- ======================================
-- 4. Functions
-- ======================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_feedback_timestamp ON public.content_feedback;
CREATE TRIGGER update_content_feedback_timestamp
    BEFORE UPDATE ON public.content_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_content_feedback_updated_at();

-- Get feedback statistics
CREATE OR REPLACE FUNCTION get_feedback_stats(
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_feedback BIGINT,
    pending BIGINT,
    reviewing BIGINT,
    resolved BIGINT,
    dismissed BIGINT,
    by_category JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_feedback,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending,
        COUNT(*) FILTER (WHERE status = 'reviewing')::BIGINT as reviewing,
        COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved,
        COUNT(*) FILTER (WHERE status = 'dismissed')::BIGINT as dismissed,
        jsonb_object_agg(
            COALESCE(fc.name_en, 'Uncategorized'),
            COUNT(cf.id)
        ) as by_category
    FROM public.content_feedback cf
    LEFT JOIN public.feedback_categories fc ON cf.category_id = fc.id
    WHERE cf.created_at >= NOW() - (period_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- 5. Comments
-- ======================================
COMMENT ON TABLE public.feedback_categories IS 'Categories for content feedback and error reports';
COMMENT ON TABLE public.content_feedback IS 'User-submitted feedback and error reports for content';
COMMENT ON COLUMN public.content_feedback.page_type IS 'Type of page: journey, article, quiz, wisdom, qna, other';
COMMENT ON COLUMN public.content_feedback.page_path IS 'Full page path for reference';
COMMENT ON COLUMN public.content_feedback.content_id IS 'Specific content identifier (step number, quiz ID, etc.)';
COMMENT ON COLUMN public.content_feedback.status IS 'Status: pending, reviewing, resolved, dismissed';
