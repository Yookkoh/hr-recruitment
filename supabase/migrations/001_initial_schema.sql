-- ============================================================
-- HR Recruitment Management - Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE recruitment_status AS ENUM (
  'Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed'
);

CREATE TYPE recruitment_stage AS ENUM (
  'Interview', 'Approval', 'Offer', 'Onboarding', 'Closed'
);

CREATE TYPE recruitment_type AS ENUM (
  'New', 'Replacement', 'Contract'
);

-- ── Profiles table (extends auth.users, stores role) ─────────
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  role       TEXT NOT NULL CHECK (role IN ('HR', 'DCOO', 'MD')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'HR')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Main recruitment table ────────────────────────────────────
CREATE TABLE public.recruitment (
  id                BIGSERIAL PRIMARY KEY,
  atoll             TEXT NOT NULL,
  island            TEXT,
  constituency      TEXT,
  requested_by      TEXT NOT NULL,
  requested_date    DATE,
  type              recruitment_type DEFAULT 'New',
  position          TEXT,
  hired_location    TEXT,
  division          TEXT,
  candidate_name    TEXT,
  id_card           TEXT,
  candidate_contact TEXT,
  status            recruitment_status DEFAULT 'Pending',
  recruitment_stage recruitment_stage,
  joined_date       DATE,
  remarks           TEXT,
  assigned_to       TEXT,
  salary            INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  created_by        UUID REFERENCES auth.users(id)
);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_recruitment_updated_at
  BEFORE UPDATE ON public.recruitment
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Performance indexes ───────────────────────────────────────
CREATE INDEX idx_recruitment_atoll        ON public.recruitment (atoll);
CREATE INDEX idx_recruitment_requested_by ON public.recruitment (requested_by);
CREATE INDEX idx_recruitment_status       ON public.recruitment (status);
CREATE INDEX idx_recruitment_stage        ON public.recruitment (recruitment_stage);
CREATE INDEX idx_recruitment_division     ON public.recruitment (division);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.recruitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role without recursive RLS calls
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles: users can only read their own profile row
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- recruitment: all authenticated roles can read all records
CREATE POLICY "recruitment_select_all_roles"
  ON public.recruitment FOR SELECT
  TO authenticated
  USING (true);

-- recruitment: only HR can insert
CREATE POLICY "recruitment_insert_hr_only"
  ON public.recruitment FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'HR');

-- recruitment: only HR can update
CREATE POLICY "recruitment_update_hr_only"
  ON public.recruitment FOR UPDATE
  TO authenticated
  USING  (public.current_user_role() = 'HR')
  WITH CHECK (public.current_user_role() = 'HR');

-- recruitment: only HR can delete
CREATE POLICY "recruitment_delete_hr_only"
  ON public.recruitment FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'HR');
