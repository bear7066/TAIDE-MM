ALTER TABLE "datasets"
  ADD COLUMN IF NOT EXISTS "assignees" jsonb DEFAULT '[]'::jsonb NOT NULL;

ALTER TABLE "models"
  ADD COLUMN IF NOT EXISTS "assignees" jsonb DEFAULT '[]'::jsonb NOT NULL;

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "assignees" jsonb DEFAULT '[]'::jsonb NOT NULL;

ALTER TABLE "evals"
  ADD COLUMN IF NOT EXISTS "assignees" jsonb DEFAULT '[]'::jsonb NOT NULL;

ALTER TABLE "discussions"
  ADD COLUMN IF NOT EXISTS "assignees" jsonb DEFAULT '[]'::jsonb NOT NULL;
