-- Newsletter System Database Schema
-- Run this in Supabase SQL Editor

-- Create newsletter access type enum
CREATE TYPE newsletter_access_type AS ENUM ('free', 'paid');

-- Create newsletter status enum  
CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL, -- Email subject line
  body text NOT NULL, -- HTML content
  plain_text text, -- Plain text version (optional)
  access_type newsletter_access_type NOT NULL DEFAULT 'free',
  status newsletter_status NOT NULL DEFAULT 'draft',
  author_id uuid NOT NULL REFERENCES users_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  scheduled_at timestamptz, -- When to send (if scheduled)
  sent_at timestamptz, -- When it was actually sent
  recipient_count integer DEFAULT 0, -- How many people it was sent to
  metadata jsonb DEFAULT '{}' -- For storing additional data like Mailgun message IDs
);

-- Create newsletter_sends table to track individual sends
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'
  mailgun_id text, -- Mailgun message ID for tracking
  error_message text, -- If failed, store error
  metadata jsonb DEFAULT '{}',
  UNIQUE(newsletter_id, user_id) -- Prevent duplicate sends
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS newsletters_status_idx ON newsletters(status);
CREATE INDEX IF NOT EXISTS newsletters_access_type_idx ON newsletters(access_type);
CREATE INDEX IF NOT EXISTS newsletters_created_at_idx ON newsletters(created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_sends_newsletter_id_idx ON newsletter_sends(newsletter_id);
CREATE INDEX IF NOT EXISTS newsletter_sends_user_id_idx ON newsletter_sends(user_id);
CREATE INDEX IF NOT EXISTS newsletter_sends_status_idx ON newsletter_sends(status);

-- Create updated_at trigger for newsletters
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletters_updated_at 
    BEFORE UPDATE ON newsletters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for newsletters (admins can manage, users can read published)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all newsletters" ON newsletters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profiles 
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Users can read newsletters that match their access level
CREATE POLICY "Users can read accessible newsletters" ON newsletters
  FOR SELECT USING (
    status = 'sent' AND (
      access_type = 'free' OR 
      (access_type = 'paid' AND EXISTS (
        SELECT 1 FROM users_profiles 
        WHERE id = auth.uid() AND type IN ('paid_user', 'admin')
      ))
    )
  );

-- RLS for newsletter_sends (admins only)
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter sends" ON newsletter_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profiles 
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Users can see their own send records
CREATE POLICY "Users can see own send records" ON newsletter_sends
  FOR SELECT USING (user_id = auth.uid());

COMMENT ON TABLE newsletters IS 'Newsletter content and metadata';
COMMENT ON TABLE newsletter_sends IS 'Individual newsletter send tracking';
COMMENT ON COLUMN newsletters.body IS 'HTML content for email';
COMMENT ON COLUMN newsletters.plain_text IS 'Plain text version for email clients that do not support HTML';
COMMENT ON COLUMN newsletters.metadata IS 'JSON storage for Mailgun IDs, analytics, etc.';
COMMENT ON COLUMN newsletter_sends.status IS 'Delivery status: sent, failed, bounced, delivered, opened, clicked';