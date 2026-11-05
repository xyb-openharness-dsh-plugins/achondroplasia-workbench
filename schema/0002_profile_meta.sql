-- 0002_profile_meta.sql：一档案一个值的零散标量（k,v），如看板 anchor 标签、模式说明。
-- 加一类零散标量 = 加一行，不改 subjects 列（宫颈癌同款教训的沿用）。
CREATE TABLE profile_meta (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  k TEXT NOT NULL,
  v TEXT,
  UNIQUE(profile_key, k)
);
