-- Subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('free', 'seed', 'series_z');

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  revenuecat_app_user_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Monthly usage tracking table
CREATE TABLE user_monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  analyses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_revenuecat ON user_subscriptions(revenuecat_app_user_id);
CREATE INDEX idx_user_monthly_usage_user_month ON user_monthly_usage(user_id, month_year);

-- RLS policies for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for user_monthly_usage
ALTER TABLE user_monthly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON user_monthly_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_monthly_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_monthly_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get or create user subscription (defaults to free)
CREATE OR REPLACE FUNCTION get_or_create_subscription(p_user_id UUID)
RETURNS user_subscriptions AS $$
DECLARE
  v_subscription user_subscriptions;
BEGIN
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF v_subscription IS NULL THEN
    INSERT INTO user_subscriptions (user_id, tier)
    VALUES (p_user_id, 'free')
    RETURNING * INTO v_subscription;
  END IF;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current month's usage
CREATE OR REPLACE FUNCTION get_or_create_monthly_usage(p_user_id UUID)
RETURNS user_monthly_usage AS $$
DECLARE
  v_usage user_monthly_usage;
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  SELECT * INTO v_usage
  FROM user_monthly_usage
  WHERE user_id = p_user_id AND month_year = v_month_year;

  IF v_usage IS NULL THEN
    INSERT INTO user_monthly_usage (user_id, month_year, analyses_count)
    VALUES (p_user_id, v_month_year, 0)
    RETURNING * INTO v_usage;
  END IF;

  RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment analysis count
CREATE OR REPLACE FUNCTION increment_analysis_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_usage user_monthly_usage;
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Upsert the usage record
  INSERT INTO user_monthly_usage (user_id, month_year, analyses_count)
  VALUES (p_user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    analyses_count = user_monthly_usage.analyses_count + 1,
    updated_at = NOW()
  RETURNING * INTO v_usage;

  RETURN v_usage.analyses_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check tier limits
CREATE OR REPLACE FUNCTION check_tier_limits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_subscription user_subscriptions;
  v_usage user_monthly_usage;
  v_profile_count INTEGER;
  v_bookmark_count INTEGER;
  v_limits JSON;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM user_subscriptions WHERE user_id = p_user_id;
  IF v_subscription IS NULL THEN
    v_subscription.tier := 'free';
  END IF;

  -- Get current month usage
  SELECT * INTO v_usage FROM user_monthly_usage
  WHERE user_id = p_user_id AND month_year = TO_CHAR(NOW(), 'YYYY-MM');

  -- Get profile count
  SELECT COUNT(*) INTO v_profile_count
  FROM user_startup_profiles WHERE user_id = p_user_id;

  -- Get bookmark count
  SELECT COUNT(*) INTO v_bookmark_count
  FROM bookmarked_episodes WHERE user_id = p_user_id;

  -- Build limits based on tier
  CASE v_subscription.tier
    WHEN 'free' THEN
      v_limits := json_build_object(
        'tier', 'free',
        'profiles', json_build_object('max', 1, 'used', v_profile_count),
        'bookmarks', json_build_object('max', 5, 'used', v_bookmark_count),
        'analyses', json_build_object('max', 4, 'used', COALESCE(v_usage.analyses_count, 0))
      );
    WHEN 'seed' THEN
      v_limits := json_build_object(
        'tier', 'seed',
        'profiles', json_build_object('max', 3, 'used', v_profile_count),
        'bookmarks', json_build_object('max', 30, 'used', v_bookmark_count), -- 10 per profile max 3 profiles
        'analyses', json_build_object('max', 10, 'used', COALESCE(v_usage.analyses_count, 0))
      );
    WHEN 'series_z' THEN
      v_limits := json_build_object(
        'tier', 'series_z',
        'profiles', json_build_object('max', 10, 'used', v_profile_count),
        'bookmarks', json_build_object('max', 100, 'used', v_bookmark_count), -- 10 per profile max 10 profiles
        'analyses', json_build_object('max', 25, 'used', COALESCE(v_usage.analyses_count, 0))
      );
    ELSE
      v_limits := json_build_object(
        'tier', 'free',
        'profiles', json_build_object('max', 1, 'used', v_profile_count),
        'bookmarks', json_build_object('max', 5, 'used', v_bookmark_count),
        'analyses', json_build_object('max', 4, 'used', COALESCE(v_usage.analyses_count, 0))
      );
  END CASE;

  RETURN v_limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_monthly_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_analysis_count TO authenticated;
GRANT EXECUTE ON FUNCTION check_tier_limits TO authenticated;

-- Add user_id to episodes table for tracking who analyzed what
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS analyzed_by UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_episodes_analyzed_by ON episodes(analyzed_by);
