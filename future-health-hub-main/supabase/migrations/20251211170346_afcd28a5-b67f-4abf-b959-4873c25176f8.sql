-- Add phone_number column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text UNIQUE;

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);