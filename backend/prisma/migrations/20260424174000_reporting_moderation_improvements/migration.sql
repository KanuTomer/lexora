ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "reportsCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "userId" TEXT;
UPDATE "reports" SET "userId" = "reporterId" WHERE "userId" IS NULL AND "reporterId" IS NOT NULL;
DELETE FROM "reports" WHERE "userId" IS NULL;

ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_reporterId_fkey";
ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_fileId_status_idx";
DROP INDEX IF EXISTS "reports_fileId_status_idx";
ALTER TABLE "reports" DROP COLUMN IF EXISTS "status";
ALTER TABLE "reports" DROP COLUMN IF EXISTS "updatedAt";
ALTER TABLE "reports" DROP COLUMN IF EXISTS "reporterId";
ALTER TABLE "reports" ALTER COLUMN "userId" SET NOT NULL;

DELETE FROM "reports" a
USING "reports" b
WHERE a."id" > b."id" AND a."fileId" = b."fileId" AND a."userId" = b."userId";

CREATE UNIQUE INDEX IF NOT EXISTS "reports_fileId_userId_key" ON "reports"("fileId", "userId");
ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_userId_fkey";
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "files"
SET "reportsCount" = sub.count
FROM (
  SELECT "fileId", COUNT(*)::int AS count
  FROM "reports"
  GROUP BY "fileId"
) sub
WHERE "files"."id" = sub."fileId";
