-- Milestone 2.7 Part 4 — CMS visual editor, client approval, S3 media, database content default

UPDATE "feature_flags"
SET "enabled" = true,
    "description" = 'Serve public website content from CMS database snapshots (enabled by default)'
WHERE "key" = 'cms.database_content';
