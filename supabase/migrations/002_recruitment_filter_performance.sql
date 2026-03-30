-- ============================================================
-- Recruitment filter and summary performance improvements
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_recruitment_atoll_created_at
  ON public.recruitment (atoll, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_requested_by_created_at
  ON public.recruitment (requested_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_atoll_requested_by_created_at
  ON public.recruitment (atoll, requested_by, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_recruitment_status_counts(
  filter_atoll TEXT DEFAULT NULL,
  filter_requested_by TEXT DEFAULT NULL
)
RETURNS TABLE (
  pending_count BIGINT,
  active_count BIGINT,
  rejected_count BIGINT,
  withdrawn_count BIGINT,
  completed_count BIGINT,
  unspecified_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  WITH filtered_recruitment AS (
    SELECT status
    FROM public.recruitment
    WHERE (NULLIF(BTRIM(filter_atoll), '') IS NULL OR atoll = NULLIF(BTRIM(filter_atoll), ''))
      AND (NULLIF(BTRIM(filter_requested_by), '') IS NULL OR requested_by = NULLIF(BTRIM(filter_requested_by), ''))
  )
  SELECT
    COUNT(*) FILTER (WHERE status = 'Pending')::BIGINT AS pending_count,
    COUNT(*) FILTER (WHERE status = 'Active')::BIGINT AS active_count,
    COUNT(*) FILTER (WHERE status = 'Rejected')::BIGINT AS rejected_count,
    COUNT(*) FILTER (WHERE status = 'Withdrawn')::BIGINT AS withdrawn_count,
    COUNT(*) FILTER (WHERE status = 'Completed')::BIGINT AS completed_count,
    COUNT(*) FILTER (WHERE status IS NULL)::BIGINT AS unspecified_count
  FROM filtered_recruitment;
$$;
