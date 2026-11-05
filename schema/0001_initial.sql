-- 小苗宝 GrowPal（软骨发育不全）· 0001_initial.sql
-- 分组：档案 2 + 指标 3 + 通用 8 + 本病种专属 6 + 导入 3 = 22 张表。
-- 纪律：ORDER BY rowid（无自依赖排序）；显式 NULL（不用空串冒充）；「在用」一律 in_use（避 SQLite 保留字 using）；
--      分节标题走 section_titles 表（加一节=加一行，不加列）；无 diagnosis/risk_level/activity_score 等判定列（派生值读时算）。
--      生长对照参考值只存引用与来源（不判定「达标/落后」）；筛查频次不入库（医生安排，非数据）。

-- ============ 档案级 2 张 ============
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sex TEXT,
  age_label TEXT,
  age_months INTEGER,
  care_role TEXT DEFAULT 'caregiver',
  headline TEXT,
  status_note TEXT,
  anchor_label TEXT,
  anchor_date TEXT,
  next_visit TEXT,
  doctor_quote TEXT,
  genetics_note TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE section_titles (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  ord INTEGER NOT NULL DEFAULT 0,
  UNIQUE(profile_key, key)
);

-- ============ 指标 3 张 ============
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT,
  cat TEXT NOT NULL,
  color TEXT,
  dec INTEGER DEFAULT 1,
  note TEXT,
  in_use INTEGER NOT NULL DEFAULT 1,
  UNIQUE(profile_key, code)
);

CREATE TABLE metric_points (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  code TEXT NOT NULL,
  d TEXT,
  d_precision TEXT,
  v REAL,
  v_text TEXT,
  src TEXT,
  org TEXT,
  note TEXT,
  visibility TEXT NOT NULL DEFAULT 'shared',
  version INTEGER NOT NULL DEFAULT 1,
  corrected_from INTEGER,
  why TEXT
);

CREATE TABLE growth_reference_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  code TEXT NOT NULL,
  ref_source TEXT NOT NULL,
  ref_text TEXT,
  pending INTEGER NOT NULL DEFAULT 1,
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 通用 8 张 ============
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  d TEXT,
  d_precision TEXT,
  label TEXT NOT NULL,
  src TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE rhythm_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  cat TEXT NOT NULL,
  last_date TEXT,
  last_org TEXT,
  note TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE viewpoints (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  d TEXT,
  item TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private',
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE trials (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  nct_like TEXT,
  phase TEXT,
  status TEXT,
  sponsor TEXT,
  sites INTEGER,
  age_min INTEGER,
  age_max INTEGER,
  needs_open_epiphysis INTEGER,
  requires_condition TEXT,
  ambulatory INTEGER,
  snapshot_date TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE saved_trials (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  trial_key TEXT NOT NULL,
  saved_on TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '在跟',
  UNIQUE(profile_key, trial_key)
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY,            -- 代理主键（候选引用用）
  profile_key TEXT NOT NULL,
  doc_id TEXT NOT NULL,              -- 业务文档 id（档案内唯一，如 doc1 / demo2-doc2）
  name TEXT NOT NULL,
  date TEXT,
  type TEXT,
  status TEXT DEFAULT '待核对',
  has_original INTEGER NOT NULL DEFAULT 0,
  in_use INTEGER NOT NULL DEFAULT 1,
  UNIQUE(profile_key, doc_id)
);

CREATE TABLE candidate_fields (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  fields_json TEXT,
  src TEXT,
  state TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE hospitals (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  name TEXT NOT NULL,
  dept TEXT,
  contact TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 本病种专属 6 张 ============
CREATE TABLE dx_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  item TEXT NOT NULL,
  d TEXT,
  d_precision TEXT,
  src TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE screening_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  cat TEXT NOT NULL,
  item TEXT NOT NULL,
  result_text TEXT NOT NULL,
  d TEXT,
  org TEXT,
  doc_id INTEGER,
  visibility TEXT NOT NULL DEFAULT 'shared',
  version INTEGER NOT NULL DEFAULT 1,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE surgery_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  name TEXT NOT NULL,
  d TEXT NOT NULL,
  org TEXT,
  doctor_quote TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE med_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  drug TEXT NOT NULL,
  status_text TEXT NOT NULL,
  start_date TEXT,
  note TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE injection_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  d TEXT NOT NULL,
  done TEXT NOT NULL,
  cooperation TEXT,
  note TEXT,
  visibility TEXT NOT NULL DEFAULT 'shared',
  version INTEGER NOT NULL DEFAULT 1,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE question_rows (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  q TEXT NOT NULL,
  asked INTEGER NOT NULL DEFAULT 0,
  ord INTEGER NOT NULL DEFAULT 0,
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 导入 3 张 ============
CREATE TABLE import_jobs (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE mineru_consents (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0,
  token_mask TEXT,
  updated_at TEXT
);

CREATE TABLE demo_meta (
  id INTEGER PRIMARY KEY,
  profile_key TEXT NOT NULL,
  data_start TEXT,
  today TEXT,
  disclaimers_json TEXT
);
