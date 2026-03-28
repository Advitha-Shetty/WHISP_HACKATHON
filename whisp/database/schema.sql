-- WHISP PostgreSQL schema (ordered for valid foreign keys)

CREATE TABLE districts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    lat             DECIMAL(9,6),
    lng             DECIMAL(9,6),
    population      INTEGER,
    risk_level      VARCHAR(20) CHECK (risk_level IN ('Low', 'Moderate', 'High')),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(200) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('citizen', 'government', 'admin')),
    name            VARCHAR(100),
    district_id     INTEGER REFERENCES districts(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    last_login      TIMESTAMP
);

CREATE TABLE health_metrics (
    id                  SERIAL PRIMARY KEY,
    district_id         INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    record_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    anaemia             DECIMAL(5,2) CHECK (anaemia BETWEEN 0 AND 100),
    menstrual_hygiene   DECIMAL(5,2) CHECK (menstrual_hygiene BETWEEN 0 AND 100),
    awareness           DECIMAL(5,2) CHECK (awareness BETWEEN 0 AND 100),
    menopause_support   DECIMAL(5,2) CHECK (menopause_support BETWEEN 0 AND 100),
    pad_centers         INTEGER DEFAULT 0,
    clinics             INTEGER DEFAULT 0,
    programs_count      INTEGER DEFAULT 0,
    whi_score           DECIMAL(5,2),
    tri_score           DECIMAL(5,2),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_district ON health_metrics(district_id);
CREATE INDEX idx_health_metrics_date ON health_metrics(record_date);

CREATE TABLE funding (
    id              SERIAL PRIMARY KEY,
    district_id     INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    fiscal_year     VARCHAR(10) NOT NULL,
    sanctioned_cr   DECIMAL(10,2),
    allocated_cr    DECIMAL(10,2),
    utilized_cr     DECIMAL(10,2),
    leakage_flagged BOOLEAN DEFAULT FALSE,
    leakage_amount  DECIMAL(10,2) DEFAULT 0,
    audit_notes     TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funding_district ON funding(district_id);
CREATE INDEX idx_funding_year ON funding(fiscal_year);

CREATE TABLE citizen_reports (
    id              SERIAL PRIMARY KEY,
    district_id     INTEGER REFERENCES districts(id),
    report_type     VARCHAR(80) NOT NULL,
    description     TEXT,
    location_name   VARCHAR(200),
    status          VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Resolved', 'Closed')),
    is_anonymous    BOOLEAN DEFAULT TRUE,
    reported_at     TIMESTAMP DEFAULT NOW(),
    resolved_at     TIMESTAMP,
    resolved_by     INTEGER REFERENCES users(id)
);

CREATE INDEX idx_reports_district ON citizen_reports(district_id);
CREATE INDEX idx_reports_status ON citizen_reports(status);

CREATE TABLE menopause_data (
    id                  SERIAL PRIMARY KEY,
    district_id         INTEGER REFERENCES districts(id),
    survey_date         DATE NOT NULL,
    women_surveyed      INTEGER,
    awareness_pct       DECIMAL(5,2),
    symptom_prevalence  DECIMAL(5,2),
    specialist_access   DECIMAL(5,2),
    support_centers     INTEGER,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE simulation_history (
    id              SERIAL PRIMARY KEY,
    district_id     INTEGER REFERENCES districts(id),
    run_by          INTEGER REFERENCES users(id),
    extra_funding   DECIMAL(10,2),
    extra_programs  INTEGER,
    base_whi        DECIMAL(5,2),
    projected_whi   DECIMAL(5,2),
    delta           DECIMAL(5,2),
    run_at          TIMESTAMP DEFAULT NOW()
);

INSERT INTO districts (name, state, lat, lng, population, risk_level) VALUES
    ('Ballari',         'Karnataka', 15.150000, 76.920000, 280000, 'High'),
    ('Bagalkot',        'Karnataka', 16.180000, 75.700000, 195000, 'Moderate'),
    ('Kalaburagi',      'Karnataka', 17.330000, 76.820000, 320000, 'High'),
    ('Bangalore Rural', 'Karnataka', 13.220000, 77.570000, 110000, 'Low'),
    ('Uttara Kannada',  'Karnataka', 14.790000, 74.680000,  95000, 'Low');

INSERT INTO health_metrics (district_id, anaemia, menstrual_hygiene, awareness, menopause_support, pad_centers, clinics, programs_count, whi_score, tri_score)
VALUES
    (1, 58, 62, 42, 28, 18, 12, 6,  54.2, 12.8),
    (2, 65, 70, 60, 45, 22, 15, 8,  62.5,  9.4),
    (3, 72, 65, 55, 38, 15, 10, 4,  62.4, 12.6),
    (4, 45, 80, 75, 62, 30, 25, 12, 63.2, 13.7),
    (5, 40, 82, 78, 70, 28, 22, 14, 63.0, 16.2);

INSERT INTO funding (district_id, fiscal_year, sanctioned_cr, allocated_cr, utilized_cr, leakage_flagged)
VALUES
    (1, '2024-25', 25, 23, 17, TRUE),
    (2, '2024-25', 20, 19, 15, FALSE),
    (3, '2024-25', 30, 28, 14, TRUE),
    (4, '2024-25', 18, 17, 16, FALSE),
    (5, '2024-25', 15, 14, 13, FALSE);
