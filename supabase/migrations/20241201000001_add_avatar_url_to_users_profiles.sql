-- Add avatar_url field to users_profiles table
ALTER TABLE users_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing users to have empty avatar_url
UPDATE users_profiles 
SET avatar_url = '' 
WHERE avatar_url IS NULL; 