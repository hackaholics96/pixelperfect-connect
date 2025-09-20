-- Fix the trigger function to properly extract phone from metadata
CREATE OR REPLACE FUNCTION public.handle_auth_user_upsert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
declare
  u_name text;
  u_lang text;
  u_phone text;
  u_state text;
begin
  u_name := null;
  u_lang := null;
  u_phone := null;
  u_state := null;

  -- Supabase stores signup metadata in raw_user_meta_data (json)
  if new.raw_user_meta_data is not null then
    begin
      u_name := (new.raw_user_meta_data->>'name');
      u_lang := (new.raw_user_meta_data->>'language');
      u_phone := (new.raw_user_meta_data->>'phone');
      u_state := (new.raw_user_meta_data->>'state_code');
    exception when others then
      u_name := null;
      u_lang := null;
      u_phone := null;
      u_state := null;
    end;
  end if;

  insert into public.users (
    id, name, phone, phone_verified, language_code, state_code, created_at
  ) values (
    new.id,
    coalesce(u_name, ''),
    coalesce(u_phone, new.phone, ''), -- Use metadata phone first, fallback to auth phone
    (new.phone_confirmed_at is not null),
    coalesce(u_lang, 'en'),
    u_state,
    now()
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.users.phone),
        phone_verified = excluded.phone_verified,
        name = coalesce(excluded.name, public.users.name),
        language_code = coalesce(excluded.language_code, public.users.language_code),
        state_code = coalesce(excluded.state_code, public.users.state_code),
        updated_at = now();

  return new;
end;
$$;