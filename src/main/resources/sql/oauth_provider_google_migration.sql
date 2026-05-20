-- Add 'google' to oauth_provider enum to support Google OAuth login.
ALTER TYPE oauth_provider ADD VALUE IF NOT EXISTS 'google';


