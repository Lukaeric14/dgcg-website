-- Update the user profile with proper name data
UPDATE users_profiles 
SET 
  full_name = 'Luka Erić',
  email = 'luka@rhetoraai.com',
  avatar_url = ''
WHERE id = '3e111c6f-b445-41c8-a3bc-71113e385fb4';

-- If the user doesn't exist, create the profile
INSERT INTO users_profiles (id, full_name, email, avatar_url, type, created_at)
VALUES (
  '3e111c6f-b445-41c8-a3bc-71113e385fb4',
  'Luka Erić',
  'luka@rhetoraai.com',
  '',
  'free_user',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW(); 