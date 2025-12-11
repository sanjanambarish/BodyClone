-- Add age and gender columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text;

-- Create table for storing OTP codes
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes'),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone_number);

-- Policy to allow edge functions to manage OTP codes (using service role)
-- No user policies needed since this is managed by edge functions with service role

-- Update handle_new_user function to include age and gender
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, age, gender)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    (NEW.raw_user_meta_data ->> 'age')::integer,
    NEW.raw_user_meta_data ->> 'gender'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'patient'));
  
  RETURN NEW;
END;
$$;