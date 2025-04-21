-- Replace [YOUR_USER_ID] with the actual user ID from the auth.users table
UPDATE profiles
SET role = 'admin'
WHERE id = '[YOUR_USER_ID]';
