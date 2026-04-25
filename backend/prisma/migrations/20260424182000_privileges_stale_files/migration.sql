ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "uploadPrivilege" TEXT NOT NULL DEFAULT 'restricted';
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "isStale" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "files_isStale_idx" ON "files"("isStale");
CREATE INDEX IF NOT EXISTS "users_uploadPrivilege_idx" ON "users"("uploadPrivilege");
