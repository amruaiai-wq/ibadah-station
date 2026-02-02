-- =============================================
-- LINE Notification System Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. User LINE Connections
-- เก็บการเชื่อมต่อ LINE ของแต่ละ user
-- =============================================
CREATE TABLE user_line_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_user_line_connections_user_id ON user_line_connections(user_id);
CREATE INDEX idx_user_line_connections_line_user_id ON user_line_connections(line_user_id);
CREATE INDEX idx_user_line_connections_is_active ON user_line_connections(is_active);

-- =============================================
-- 2. User Notification Preferences
-- ตั้งค่าการแจ้งเตือนของแต่ละ user
-- =============================================
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Prayer time notifications
  prayer_fajr BOOLEAN DEFAULT true,
  prayer_dhuhr BOOLEAN DEFAULT true,
  prayer_asr BOOLEAN DEFAULT true,
  prayer_maghrib BOOLEAN DEFAULT true,
  prayer_isha BOOLEAN DEFAULT true,
  prayer_reminder_minutes INTEGER DEFAULT 10, -- แจ้งก่อนเวลาละหมาดกี่นาที

  -- Adhkar notifications
  adhkar_morning BOOLEAN DEFAULT true,   -- 06:00
  adhkar_evening BOOLEAN DEFAULT true,   -- 17:00

  -- Daily wisdom notification
  daily_wisdom BOOLEAN DEFAULT true,     -- 08:00

  -- Quran reminder
  quran_reminder BOOLEAN DEFAULT true,   -- 20:00

  -- User location for prayer times calculation
  latitude DECIMAL(10, 8) DEFAULT 13.7563,   -- Default: Bangkok
  longitude DECIMAL(11, 8) DEFAULT 100.5018,
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  location_name VARCHAR(100) DEFAULT 'Bangkok',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_notification_preferences_user_id ON user_notification_preferences(user_id);

-- =============================================
-- 3. Notification Logs
-- บันทึกการส่ง notification
-- =============================================
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  line_user_id VARCHAR(50) NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- prayer_fajr, prayer_dhuhr, adhkar_morning, adhkar_evening, daily_wisdom, quran_reminder
  message_content TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_line_user_id ON notification_logs(line_user_id);
CREATE INDEX idx_notification_logs_notification_type ON notification_logs(notification_type);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- =============================================
-- 4. Prayer Times Cache
-- Cache เวลาละหมาดของแต่ละ user (อัพเดททุกวัน)
-- =============================================
CREATE TABLE prayer_times_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fajr TIME NOT NULL,
  sunrise TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_prayer_times_cache_user_date ON prayer_times_cache(user_id, date);
CREATE INDEX idx_prayer_times_cache_date ON prayer_times_cache(date);

-- =============================================
-- 5. LINE Link Tokens
-- Token สำหรับการ link account
-- =============================================
CREATE TABLE line_link_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_line_link_tokens_token ON line_link_tokens(token);
CREATE INDEX idx_line_link_tokens_user_id ON line_link_tokens(user_id);
CREATE INDEX idx_line_link_tokens_expires_at ON line_link_tokens(expires_at);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE user_line_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_link_tokens ENABLE ROW LEVEL SECURITY;

-- user_line_connections policies
CREATE POLICY "Users can view own LINE connection" ON user_line_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LINE connection" ON user_line_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LINE connection" ON user_line_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own LINE connection" ON user_line_connections
  FOR DELETE USING (auth.uid() = user_id);

-- user_notification_preferences policies
CREATE POLICY "Users can view own preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- notification_logs policies (read only for users)
CREATE POLICY "Users can view own notification logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

-- prayer_times_cache policies
CREATE POLICY "Users can view own prayer times cache" ON prayer_times_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer times cache" ON prayer_times_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- line_link_tokens policies
CREATE POLICY "Users can view own link tokens" ON line_link_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own link tokens" ON line_link_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_user_line_connections_updated_at
  BEFORE UPDATE ON user_line_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Function: Auto-create notification preferences on LINE connection
-- =============================================
CREATE OR REPLACE FUNCTION create_notification_preferences_on_line_connect()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_line_connection_created
  AFTER INSERT ON user_line_connections
  FOR EACH ROW EXECUTE FUNCTION create_notification_preferences_on_line_connect();

-- =============================================
-- Function: Get users for prayer notification
-- ดึง users ที่ต้องส่ง notification ในช่วงเวลานี้
-- =============================================
CREATE OR REPLACE FUNCTION get_users_for_prayer_notification(
  prayer_name VARCHAR,
  check_time TIME,
  reminder_window_minutes INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  line_user_id VARCHAR,
  prayer_time TIME,
  latitude DECIMAL,
  longitude DECIMAL,
  location_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ulc.user_id,
    ulc.line_user_id,
    CASE prayer_name
      WHEN 'fajr' THEN ptc.fajr
      WHEN 'dhuhr' THEN ptc.dhuhr
      WHEN 'asr' THEN ptc.asr
      WHEN 'maghrib' THEN ptc.maghrib
      WHEN 'isha' THEN ptc.isha
    END as prayer_time,
    unp.latitude,
    unp.longitude,
    unp.location_name
  FROM user_line_connections ulc
  INNER JOIN user_notification_preferences unp ON ulc.user_id = unp.user_id
  INNER JOIN prayer_times_cache ptc ON ulc.user_id = ptc.user_id AND ptc.date = CURRENT_DATE
  WHERE ulc.is_active = true
    AND CASE prayer_name
      WHEN 'fajr' THEN unp.prayer_fajr
      WHEN 'dhuhr' THEN unp.prayer_dhuhr
      WHEN 'asr' THEN unp.prayer_asr
      WHEN 'maghrib' THEN unp.prayer_maghrib
      WHEN 'isha' THEN unp.prayer_isha
      ELSE false
    END = true
    AND CASE prayer_name
      WHEN 'fajr' THEN ptc.fajr
      WHEN 'dhuhr' THEN ptc.dhuhr
      WHEN 'asr' THEN ptc.asr
      WHEN 'maghrib' THEN ptc.maghrib
      WHEN 'isha' THEN ptc.isha
    END - (unp.prayer_reminder_minutes || ' minutes')::INTERVAL <= check_time
    AND CASE prayer_name
      WHEN 'fajr' THEN ptc.fajr
      WHEN 'dhuhr' THEN ptc.dhuhr
      WHEN 'asr' THEN ptc.asr
      WHEN 'maghrib' THEN ptc.maghrib
      WHEN 'isha' THEN ptc.isha
    END - (unp.prayer_reminder_minutes || ' minutes')::INTERVAL > check_time - (reminder_window_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Get users for scheduled notification
-- ดึง users สำหรับ notification ตามเวลาที่กำหนด
-- =============================================
CREATE OR REPLACE FUNCTION get_users_for_scheduled_notification(
  notification_type VARCHAR,
  target_hour INTEGER
)
RETURNS TABLE (
  user_id UUID,
  line_user_id VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ulc.user_id,
    ulc.line_user_id
  FROM user_line_connections ulc
  INNER JOIN user_notification_preferences unp ON ulc.user_id = unp.user_id
  WHERE ulc.is_active = true
    AND EXTRACT(HOUR FROM NOW() AT TIME ZONE unp.timezone) = target_hour
    AND CASE notification_type
      WHEN 'adhkar_morning' THEN unp.adhkar_morning
      WHEN 'adhkar_evening' THEN unp.adhkar_evening
      WHEN 'daily_wisdom' THEN unp.daily_wisdom
      WHEN 'quran_reminder' THEN unp.quran_reminder
      ELSE false
    END = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Clean up old notification logs (older than 30 days)
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM notification_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Clean up expired link tokens
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_link_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM line_link_tokens
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Clean up old prayer times cache
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_prayer_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM prayer_times_cache
  WHERE date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
