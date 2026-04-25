-- Normalize users for profile/signup details.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
UPDATE "users"
SET "username" = lower(regexp_replace(coalesce(NULLIF(split_part("email", '@', 1), ''), 'user-' || "id"), '[^a-zA-Z0-9_]', '_', 'g')) || '_' || substr("id", 1, 6)
WHERE "username" IS NULL;
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "programId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "programs" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "collegeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

INSERT INTO "programs" ("id", "name", "collegeId", "updatedAt")
SELECT 'program_' || "id", "name", "collegeId", CURRENT_TIMESTAMP
FROM "courses"
ON CONFLICT DO NOTHING;

UPDATE "users"
SET "programId" = sub."programId"
FROM (
  SELECT p."id" AS "programId", p."collegeId"
  FROM "programs" p
) sub
WHERE "users"."programId" IS NULL AND "users"."collegeId" = sub."collegeId";

-- Convert file IDs from uuid storage to text/cuid-compatible storage while preserving existing IDs.
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_fileId_fkey";
ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_fileId_fkey";
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_userId_fileId_key";
ALTER TABLE "files" DROP CONSTRAINT IF EXISTS "files_pkey";
ALTER TABLE "files" ALTER COLUMN "id" TYPE TEXT USING "id"::text;
ALTER TABLE "bookmarks" ALTER COLUMN "fileId" TYPE TEXT USING "fileId"::text;
ALTER TABLE "reports" ALTER COLUMN "fileId" TYPE TEXT USING "fileId"::text;
ALTER TABLE "files" ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");
DROP INDEX IF EXISTS "bookmarks_userId_fileId_key";
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fileId_key" UNIQUE ("userId", "fileId");
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
UPDATE "files" SET "status" = 'approved' WHERE "status" IS NULL OR "status" = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "colleges_name_key" ON "colleges"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "programs_collegeId_name_key" ON "programs"("collegeId", "name");
CREATE INDEX IF NOT EXISTS "files_status_idx" ON "files"("status");

ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_collegeId_fkey";
ALTER TABLE "programs" ADD CONSTRAINT "programs_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_programId_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;


