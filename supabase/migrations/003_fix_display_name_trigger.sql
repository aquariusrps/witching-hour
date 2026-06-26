CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  chosen_name text;
  base_name   text;
  final_name  text;
BEGIN
  -- Prefer user-chosen display_name from registration metadata
  chosen_name := NEW.raw_user_meta_data->>'display_name';

  IF chosen_name IS NOT NULL AND TRIM(chosen_name) <> '' THEN
    -- Sanitise: strip chars not in [a-zA-Z0-9_-], trim to 30 chars
    final_name := LEFT(
      REGEXP_REPLACE(TRIM(chosen_name), '[^a-zA-Z0-9_-]', '', 'g'),
      30
    );
  END IF;

  -- Fall back to email prefix if metadata name absent or empty after sanitisation
  IF final_name IS NULL OR final_name = '' THEN
    base_name  := LEFT(
      REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_-]', '_', 'g'),
      26
    );
    final_name := base_name;
  END IF;

  -- Collision: append random 4-digit suffix
  IF EXISTS (SELECT 1 FROM public.users WHERE display_name = final_name) THEN
    final_name := LEFT(final_name, 26) || LPAD((FLOOR(RANDOM() * 9000) + 1000)::int::text, 4, '0');
  END IF;

  INSERT INTO public.users (id, display_name, created_at)
  VALUES (NEW.id, final_name, NOW());

  RETURN NEW;
END;
$$;
