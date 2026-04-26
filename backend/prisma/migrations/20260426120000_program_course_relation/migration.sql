-- Non-breaking Program -> Course relationship.
-- The column is nullable first so existing production rows remain valid during deploy.
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "courseId" TEXT;

-- Backfill using the historical data contract:
-- within the same college, Program.name was expected to match Course.name.
-- Only unambiguous one-to-one matches are updated.
WITH matches AS (
  SELECT
    p."id" AS "programId",
    MIN(c."id") AS "courseId",
    COUNT(c."id") AS "matchCount"
  FROM "programs" p
  JOIN "courses" c
    ON p."collegeId" = c."collegeId"
   AND p."name" = c."name"
  WHERE p."courseId" IS NULL
  GROUP BY p."id"
)
UPDATE "programs" p
SET "courseId" = matches."courseId"
FROM matches
WHERE p."id" = matches."programId"
  AND matches."matchCount" = 1;

-- Keep this as a read-only anomaly report in migration logs. It does not fail
-- because production may contain legacy programs that need manual review.
DO $$
DECLARE
  unmatched_count INTEGER;
  ambiguous_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM "programs"
  WHERE "courseId" IS NULL;

  SELECT COUNT(*) INTO ambiguous_count
  FROM (
    SELECT p."id"
    FROM "programs" p
    JOIN "courses" c
      ON p."collegeId" = c."collegeId"
     AND p."name" = c."name"
    WHERE p."courseId" IS NULL
    GROUP BY p."id"
    HAVING COUNT(c."id") > 1
  ) ambiguous;

  IF unmatched_count > 0 THEN
    RAISE NOTICE 'Program-course backfill left % program(s) without courseId; review by collegeId/name.', unmatched_count;
  END IF;

  IF ambiguous_count > 0 THEN
    RAISE NOTICE 'Program-course backfill found % ambiguous program match(es); resolve manually.', ambiguous_count;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "programs_courseId_idx" ON "programs"("courseId");

ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_courseId_fkey";
ALTER TABLE "programs"
  ADD CONSTRAINT "programs_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
