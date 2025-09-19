-- Safe migration to update CropDoc schema
-- First, create languages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.languages (
  code varchar(10) PRIMARY KEY,
  name text NOT NULL,
  direction varchar(3) NOT NULL DEFAULT 'ltr',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert language data first
INSERT INTO public.languages (code, name, direction) VALUES
  ('en', 'English', 'ltr'),
  ('ta', 'Tamil', 'ltr'),
  ('hi', 'Hindi', 'ltr'),
  ('bn', 'Bengali', 'ltr'),
  ('pa', 'Punjabi', 'ltr')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  direction = EXCLUDED.direction;

-- Create states table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.states (
  code varchar(20) PRIMARY KEY,
  name text NOT NULL,
  country_code varchar(5) NOT NULL DEFAULT 'IN',
  created_at timestamptz NOT NULL DEFAULT now()
);

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

-- Now safely update users table structure
-- Add phone_country_code if it doesn't exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS phone_country_code varchar(8);

-- Update existing phone_verified default if needed
ALTER TABLE public.users 
  ALTER COLUMN phone_verified SET DEFAULT false;

-- Add unique index on phone (case-insensitive) if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON public.users(lower(phone));

-- Create/update the updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add foreign key constraints only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_language_code_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users
          ADD CONSTRAINT users_language_code_fkey 
          FOREIGN KEY (language_code) REFERENCES public.languages(code) 
          ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_state_code_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users
          ADD CONSTRAINT users_state_code_fkey 
          FOREIGN KEY (state_code) REFERENCES public.states(code) 
          ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;

-- Update OTP verifications table structure
-- Add code_expires_at if it doesn't exist
ALTER TABLE public.otp_verifications
  ADD COLUMN IF NOT EXISTS code_expires_at timestamptz DEFAULT (now() + interval '10 minutes');

-- Update existing rows that don't have expiration
UPDATE public.otp_verifications 
SET code_expires_at = created_at + interval '10 minutes' 
WHERE code_expires_at IS NULL;

-- Make the column NOT NULL after updating existing rows
ALTER TABLE public.otp_verifications
  ALTER COLUMN code_expires_at SET NOT NULL;

-- Add index for phone lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS otp_phone_idx ON public.otp_verifications(lower(phone));