-- Align profile roles with the current app role model and password-change flow.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET role = CASE role
  WHEN 'HR' THEN 'recruiter'
  WHEN 'DCOO' THEN 'executive'
  WHEN 'MD' THEN 'executive'
  ELSE role
END
WHERE role IN ('HR', 'DCOO', 'MD');

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('recruiter', 'executive', 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'recruiter')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "recruitment_insert_hr_only" ON public.recruitment;
DROP POLICY IF EXISTS "recruitment_update_hr_only" ON public.recruitment;
DROP POLICY IF EXISTS "recruitment_delete_hr_only" ON public.recruitment;

CREATE POLICY "recruitment_insert_manager_roles"
  ON public.recruitment FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('recruiter', 'admin'));

CREATE POLICY "recruitment_update_manager_roles"
  ON public.recruitment FOR UPDATE
  TO authenticated
  USING (public.current_user_role() IN ('recruiter', 'admin'))
  WITH CHECK (public.current_user_role() IN ('recruiter', 'admin'));

CREATE POLICY "recruitment_delete_manager_roles"
  ON public.recruitment FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('recruiter', 'admin'));
