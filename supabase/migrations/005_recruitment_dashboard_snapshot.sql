-- ============================================================
-- Recruitment dashboard fast-path query and supporting indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_recruitment_created_at_id_desc
  ON public.recruitment (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_status_created_at_id_desc
  ON public.recruitment (status, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_atoll_status_created_at_id_desc
  ON public.recruitment (atoll, status, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_requested_by_status_created_at_id_desc
  ON public.recruitment (requested_by, status, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_atoll_requested_by_status_created_at_id_desc
  ON public.recruitment (atoll, requested_by, status, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_recruitment_dashboard_snapshot(
  filter_atoll TEXT DEFAULT NULL,
  filter_requested_by TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 25
)
RETURNS TABLE (
  records JSONB,
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
  WITH params AS (
    SELECT
      NULLIF(BTRIM(filter_atoll), '') AS atoll,
      NULLIF(BTRIM(filter_requested_by), '') AS requested_by,
      NULLIF(BTRIM(filter_status), '') AS status_filter,
      GREATEST(COALESCE(page_number, 1), 1) AS page_number,
      GREATEST(LEAST(COALESCE(page_size, 25), 100), 1) AS page_size
  ),
  base AS (
    SELECT
      r.id,
      r.atoll,
      r.island,
      r.requested_by,
      r.position,
      r.division,
      r.candidate_name,
      r.status,
      r.recruitment_stage,
      r.joined_date,
      r.salary,
      r.created_at
    FROM public.recruitment r
    CROSS JOIN params p
    WHERE (p.atoll IS NULL OR r.atoll = p.atoll)
      AND (p.requested_by IS NULL OR r.requested_by = p.requested_by)
  ),
  page_rows AS (
    SELECT
      b.id,
      b.atoll,
      b.island,
      b.requested_by,
      b.position,
      b.division,
      b.candidate_name,
      b.status,
      b.recruitment_stage,
      b.joined_date,
      b.salary,
      b.created_at
    FROM base b
    CROSS JOIN params p
    WHERE p.status_filter IS NULL
      OR (p.status_filter = 'Unspecified' AND b.status IS NULL)
      OR (p.status_filter <> 'Unspecified' AND b.status::TEXT = p.status_filter)
    ORDER BY b.created_at DESC, b.id DESC
    LIMIT (SELECT page_size FROM params)
    OFFSET ((SELECT page_number FROM params) - 1) * (SELECT page_size FROM params)
  )
  SELECT
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pr.id,
            'atoll', pr.atoll,
            'island', pr.island,
            'requested_by', pr.requested_by,
            'position', pr.position,
            'division', pr.division,
            'candidate_name', pr.candidate_name,
            'status', pr.status,
            'recruitment_stage', pr.recruitment_stage,
            'joined_date', pr.joined_date,
            'salary', pr.salary
          )
          ORDER BY pr.created_at DESC, pr.id DESC
        )
        FROM page_rows pr
      ),
      '[]'::JSONB
    ) AS records,
    COUNT(*) FILTER (WHERE base.status = 'Pending')::BIGINT AS pending_count,
    COUNT(*) FILTER (WHERE base.status = 'Active')::BIGINT AS active_count,
    COUNT(*) FILTER (WHERE base.status = 'Rejected')::BIGINT AS rejected_count,
    COUNT(*) FILTER (WHERE base.status = 'Withdrawn')::BIGINT AS withdrawn_count,
    COUNT(*) FILTER (WHERE base.status = 'Completed')::BIGINT AS completed_count,
    COUNT(*) FILTER (WHERE base.status IS NULL)::BIGINT AS unspecified_count
  FROM base;
$$;
