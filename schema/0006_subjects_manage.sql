-- 0006_subjects_manage.sql：档案可管理（新建后归档/恢复，无裸删除）。
-- in_use=1 的档案出现在切换列表；归档=in_use 0 + archived_at 留痕，可恢复。
ALTER TABLE subjects ADD COLUMN in_use INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subjects ADD COLUMN archived_at TEXT;
