-- Add reusable file assets for content-based deduplication.
CREATE TABLE IF NOT EXISTS "file_assets" (
  "id" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "publicId" TEXT,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "file_assets_contentHash_key" ON "file_assets"("contentHash");

ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "assetId" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "moderatorId" TEXT;

CREATE INDEX IF NOT EXISTS "files_contentHash_idx" ON "files"("contentHash");
CREATE INDEX IF NOT EXISTS "files_assetId_idx" ON "files"("assetId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'files_assetId_fkey'
      AND table_name = 'files'
  ) THEN
    ALTER TABLE "files"
      ADD CONSTRAINT "files_assetId_fkey"
      FOREIGN KEY ("assetId") REFERENCES "file_assets"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
