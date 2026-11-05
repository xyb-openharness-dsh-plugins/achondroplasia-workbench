-- 0004_surgery_bus_id.sql：surgery_rows 增加档案内业务 id（demo-data 的 s1/s2…），更正链用它定位。
ALTER TABLE surgery_rows ADD COLUMN surg_id TEXT;
