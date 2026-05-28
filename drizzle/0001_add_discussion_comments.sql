ALTER TABLE "discussions"
  ADD COLUMN IF NOT EXISTS "comments" jsonb DEFAULT '[]'::jsonb NOT NULL;
