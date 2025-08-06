-- Fix the user profile name that's currently null
UPDATE users_profiles 
SET 
  full_name = 'Luka Erić',
  email = 'luka@rhetoraai.com'
WHERE id = '3e111c6f-b445-41c8-a3bc-71113e385fb4';

-- Verify the update worked
SELECT id, full_name, email, avatar_url FROM users_profiles WHERE id = '3e111c6f-b445-41c8-a3bc-71113e385fb4'; 