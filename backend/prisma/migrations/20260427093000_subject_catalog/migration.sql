-- College-scoped shared subject identity.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "subject_catalogs" (
  "id" TEXT NOT NULL,
  "collegeId" TEXT NOT NULL,
  "subjectCode" TEXT NOT NULL,
  "canonicalName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "subject_catalogs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "subject_catalogs_collegeId_subjectCode_key"
  ON "subject_catalogs"("collegeId", "subjectCode");
CREATE INDEX IF NOT EXISTS "subject_catalogs_subjectCode_idx"
  ON "subject_catalogs"("subjectCode");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subject_catalogs_collegeId_fkey'
      AND table_name = 'subject_catalogs'
  ) THEN
    ALTER TABLE "subject_catalogs"
      ADD CONSTRAINT "subject_catalogs_collegeId_fkey"
      FOREIGN KEY ("collegeId") REFERENCES "colleges"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "subjectCatalogId" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "subjectCatalogId" TEXT;

-- Backfill one catalog subject per college + subject code. Names remain display metadata on Subject.
INSERT INTO "subject_catalogs" ("id", "collegeId", "subjectCode", "canonicalName", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  grouped."collegeId",
  grouped."subjectCode",
  MIN(grouped."subjectName") AS "canonicalName",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT
    c."collegeId",
    UPPER(TRIM(s."subjectCode")) AS "subjectCode",
    NULLIF(TRIM(s."subjectName"), '') AS "subjectName"
  FROM "subjects" s
  INNER JOIN "courses" c ON c."id" = s."courseId"
  WHERE s."subjectCode" IS NOT NULL AND TRIM(s."subjectCode") <> ''
) grouped
GROUP BY grouped."collegeId", grouped."subjectCode"
ON CONFLICT ("collegeId", "subjectCode") DO UPDATE SET
  "canonicalName" = COALESCE("subject_catalogs"."canonicalName", EXCLUDED."canonicalName"),
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "subjects" s
SET "subjectCatalogId" = sc."id"
FROM "courses" c
INNER JOIN "subject_catalogs" sc
  ON sc."collegeId" = c."collegeId"
WHERE c."id" = s."courseId"
  AND sc."subjectCode" = UPPER(TRIM(s."subjectCode"))
  AND s."subjectCatalogId" IS NULL;

UPDATE "files" f
SET "subjectCatalogId" = s."subjectCatalogId"
FROM "subjects" s
WHERE s."id" = f."subjectId"
  AND f."subjectCatalogId" IS NULL;

CREATE INDEX IF NOT EXISTS "subjects_subjectCatalogId_idx"
  ON "subjects"("subjectCatalogId");
CREATE INDEX IF NOT EXISTS "files_subjectCatalogId_fileType_idx"
  ON "files"("subjectCatalogId", "fileType");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subjects_subjectCatalogId_fkey'
      AND table_name = 'subjects'
  ) THEN
    ALTER TABLE "subjects"
      ADD CONSTRAINT "subjects_subjectCatalogId_fkey"
      FOREIGN KEY ("subjectCatalogId") REFERENCES "subject_catalogs"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'files_subjectCatalogId_fkey'
      AND table_name = 'files'
  ) THEN
    ALTER TABLE "files"
      ADD CONSTRAINT "files_subjectCatalogId_fkey"
      FOREIGN KEY ("subjectCatalogId") REFERENCES "subject_catalogs"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
