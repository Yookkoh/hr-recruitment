-- ============================================================
-- Recruitment filter option performance improvements
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_recruitment_filter_options()
RETURNS TABLE (
  atolls TEXT[],
  requested_bys TEXT[]
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(
      ARRAY(
        SELECT DISTINCT atoll
        FROM public.recruitment
        WHERE atoll IS NOT NULL AND BTRIM(atoll) <> ''
        ORDER BY atoll
      ),
      ARRAY[]::TEXT[]
    ) AS atolls,
    COALESCE(
      ARRAY(
        SELECT DISTINCT requested_by
        FROM public.recruitment
        WHERE requested_by IS NOT NULL AND BTRIM(requested_by) <> ''
        ORDER BY requested_by
      ),
      ARRAY[]::TEXT[]
    ) AS requested_bys;
$$;
