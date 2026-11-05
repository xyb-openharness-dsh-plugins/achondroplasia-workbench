-- 0005_trials_region.sql：登记快照补「地区」维度（E2 检索条件；非肿瘤无病理/靶点维度，药物方向走关键词）。
ALTER TABLE trials ADD COLUMN region TEXT;
