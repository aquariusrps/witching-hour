-- Migration 002: Auth trigger
-- Automatically inserts a public.users row when auth.users receives a new row

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  base_name  text;
  final_name text;
BEGIN
  -- Sanitise email prefix to alphanumeric + _ + -; cap at 26 chars (room for 4-digit suffix)
  base_name := LEFT(
    REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_-]', '_', 'g'),
    26
  );
  final_name := base_name;

  -- If display_name is taken, append a random 4-digit number (1000–9999)
  IF EXISTS (SELECT 1 FROM public.users WHERE display_name = final_name) THEN
    final_name := base_name || LPAD((FLOOR(RANDOM() * 9000) + 1000)::int::text, 4, '0');
  END IF;

  INSERT INTO public.users (id, display_name, created_at)
  VALUES (NEW.id, final_name, NOW());

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
