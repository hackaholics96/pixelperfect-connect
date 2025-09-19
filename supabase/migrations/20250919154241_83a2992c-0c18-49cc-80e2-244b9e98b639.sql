-- CropDoc Database Schema Migration
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update existing tables structure to match CropDoc requirements
-- First, let's create the base schema for languages and states if not exists

-- Languages table (update existing structure)
ALTER TABLE public.languages DROP CONSTRAINT IF EXISTS languages_pkey CASCADE;
DROP TABLE IF EXISTS public.languages CASCADE;

CREATE TABLE public.languages (
  code varchar(10) PRIMARY KEY,
  name text NOT NULL,
  direction varchar(3) NOT NULL DEFAULT 'ltr',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- States table (update existing structure)
ALTER TABLE public.states DROP CONSTRAINT IF EXISTS states_pkey CASCADE;
DROP TABLE IF EXISTS public.states CASCADE;

CREATE TABLE public.states (
  code varchar(20) PRIMARY KEY,
  name text NOT NULL,
  country_code varchar(5) NOT NULL DEFAULT 'IN',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Update users table structure to match CropDoc requirements
-- Drop existing constraints and recreate table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_language_code_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_state_code_fkey;

-- Recreate users table with correct structure
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS phone_country_code,
  ADD COLUMN IF NOT EXISTS phone_country_code varchar(8),
  ALTER COLUMN phone_verified SET DEFAULT false,
  ALTER COLUMN language_code TYPE varchar(10),
  ALTER COLUMN state_code TYPE varchar(20);

-- Add unique index on phone (case-insensitive)
DROP INDEX IF EXISTS users_phone_idx;
CREATE UNIQUE INDEX users_phone_idx ON public.users(lower(phone));

-- Create/update the updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger for users table
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add foreign key constraints
ALTER TABLE public.users
  ADD CONSTRAINT users_language_code_fkey 
  FOREIGN KEY (language_code) REFERENCES public.languages(code) 
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.users
  ADD CONSTRAINT users_state_code_fkey 
  FOREIGN KEY (state_code) REFERENCES public.states(code) 
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Update OTP verifications table structure
ALTER TABLE public.otp_verifications
  ALTER COLUMN code TYPE varchar(100),
  ADD COLUMN IF NOT EXISTS code_expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes');

-- Add index for phone lookups
DROP INDEX IF EXISTS otp_phone_idx;
CREATE INDEX otp_phone_idx ON public.otp_verifications(lower(phone));

-- Insert language data
INSERT INTO public.languages (code, name, direction) VALUES
  ('en', 'English', 'ltr'),
  ('ta', 'Tamil', 'ltr'),
  ('hi', 'Hindi', 'ltr'),
  ('bn', 'Bengali', 'ltr'),
  ('pa', 'Punjabi', 'ltr')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  direction = EXCLUDED.direction;

-- Insert states data
INSERT INTO public.states (code, name, country_code) VALUES
  ('AP','Andhra Pradesh','IN'),
  ('AR','Arunachal Pradesh','IN'),
  ('AS','Assam','IN'),
  ('BR','Bihar','IN'),
  ('CT','Chhattisgarh','IN'),
  ('GA','Goa','IN'),
  ('GJ','Gujarat','IN'),
  ('HR','Haryana','IN'),
  ('HP','Himachal Pradesh','IN'),
  ('JH','Jharkhand','IN'),
  ('KA','Karnataka','IN'),
  ('KL','Kerala','IN'),
  ('MP','Madhya Pradesh','IN'),
  ('MH','Maharashtra','IN'),
  ('MN','Manipur','IN'),
  ('ML','Meghalaya','IN'),
  ('MZ','Mizoram','IN'),
  ('NL','Nagaland','IN'),
  ('OR','Odisha','IN'),
  ('PB','Punjab','IN'),
  ('RJ','Rajasthan','IN'),
  ('SK','Sikkim','IN'),
  ('TN','Tamil Nadu','IN'),
  ('TG','Telangana','IN'),
  ('TR','Tripura','IN'),
  ('UP','Uttar Pradesh','IN'),
  ('UT','Uttarakhand','IN'),
  ('WB','West Bengal','IN'),
  ('AN','Andaman and Nicobar Islands','IN'),
  ('CH','Chandigarh','IN'),
  ('DN','Dadra and Nagar Haveli and Daman and Diu','IN'),
  ('DL','Delhi','IN'),
  ('JK','Jammu and Kashmir','IN'),
  ('LA','Ladakh','IN'),
  ('LD','Lakshadweep','IN'),
  ('PY','Puducherry','IN')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  country_code = EXCLUDED.country_code;