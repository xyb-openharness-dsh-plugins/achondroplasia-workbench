-- 0003_candidate_bus_id.sql：candidate_fields 增加档案内业务 id（demo-data 的 c1/c2…）。
-- 代理主键 id 保留（数据库内引用），对外展示与 accept/reject 路由用 cand_id。
ALTER TABLE candidate_fields ADD COLUMN cand_id TEXT;
