-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Sovereign Countries & Territories
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR(3) PRIMARY KEY, -- ARG, BOL, BRA, CHL, COL, ECU, GUY, PRY, PER, SUR, URY, VEN, GUF
    name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    ppp_factor NUMERIC(10, 4) NOT NULL,
    poverty_line_moderate_usd_ppp NUMERIC(8, 2) NOT NULL,
    poverty_line_extreme_usd_ppp NUMERIC(8, 2) NOT NULL,
    rural_population_pct NUMERIC(5, 2) NOT NULL,
    geom GEOMETRY(Point, 4326)
);

-- 2. Household Agents Microdata Table (Supports Survey Design Factors)
CREATE TABLE IF NOT EXISTS household_agents (
    id VARCHAR(50) PRIMARY KEY,
    country_code VARCHAR(3) REFERENCES countries(code),
    region_name VARCHAR(100) NOT NULL,
    typology VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326),
    expansion_factor NUMERIC(10, 2) NOT NULL,
    cluster_id VARCHAR(50) NOT NULL,
    stratum_id VARCHAR(50) NOT NULL,
    household_size INT NOT NULL,
    num_children INT NOT NULL,
    num_elderly INT NOT NULL,
    female_head BOOLEAN NOT NULL,
    indigenous_or_afro BOOLEAN NOT NULL,
    head_education_years INT NOT NULL,
    land_hectares NUMERIC(8, 2) NOT NULL,
    livestock_units INT NOT NULL,
    physical_asset_index NUMERIC(5, 3) NOT NULL,
    baseline_consumption_per_capita NUMERIC(10, 2) NOT NULL,
    baseline_income_per_capita NUMERIC(10, 2) NOT NULL,
    baseline_poverty_status VARCHAR(20) NOT NULL,
    drought_vulnerability NUMERIC(4, 2) NOT NULL,
    flood_vulnerability NUMERIC(4, 2) NOT NULL,
    frost_vulnerability NUMERIC(4, 2) NOT NULL,
    is_synthetic BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_households_country ON household_agents(country_code);
CREATE INDEX IF NOT EXISTS idx_households_cluster ON household_agents(cluster_id);
CREATE INDEX IF NOT EXISTS idx_households_geom ON household_agents USING GIST(geom);

-- 3. Policy Simulation Scenarios
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id VARCHAR(50) PRIMARY KEY,
    country_code VARCHAR(3) REFERENCES countries(code),
    policy_name VARCHAR(200) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    base_amount_usd_ppp NUMERIC(8, 2) NOT NULL,
    child_supplement_usd_ppp NUMERIC(8, 2) NOT NULL,
    target_criterion VARCHAR(50) NOT NULL,
    enforce_school_attendance BOOLEAN NOT NULL,
    climate_shock_type VARCHAR(50) NOT NULL,
    fgt0_baseline NUMERIC(5, 2) NOT NULL,
    fgt0_simulated NUMERIC(5, 2) NOT NULL,
    poverty_reduction_pp NUMERIC(5, 2) NOT NULL,
    gini_simulated NUMERIC(6, 4) NOT NULL,
    annual_fiscal_cost_usd_ppp NUMERIC(14, 2) NOT NULL,
    fiscal_multiplier NUMERIC(4, 2) NOT NULL,
    seed INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LangChain / RAG Document Vector Store (pgvector)
CREATE TABLE IF NOT EXISTS policy_documents_rag (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    country_code VARCHAR(3),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    source_url VARCHAR(500),
    published_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_policy_docs_embedding ON policy_documents_rag USING ivfflat (embedding vector_cosine_ops);

-- Seed basic country references
INSERT INTO countries (code, name, currency_code, ppp_factor, poverty_line_moderate_usd_ppp, poverty_line_extreme_usd_ppp, rural_population_pct, geom)
VALUES 
('ARG', 'Argentina', 'ARS', 380.0, 205.5, 109.5, 7.9, ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)),
('BOL', 'Bolivia', 'BOB', 2.85, 205.5, 109.5, 29.8, ST_SetSRID(ST_MakePoint(-63.5887, -16.2902), 4326)),
('BRA', 'Brasil', 'BRL', 2.70, 205.5, 109.5, 12.2, ST_SetSRID(ST_MakePoint(-51.9253, -14.2350), 4326)),
('CHL', 'Chile', 'CLP', 490.0, 205.5, 109.5, 12.1, ST_SetSRID(ST_MakePoint(-71.5430, -35.6751), 4326)),
('COL', 'Colombia', 'COP', 1650.0, 205.5, 109.5, 18.2, ST_SetSRID(ST_MakePoint(-74.2973, 4.5709), 4326)),
('ECU', 'Ecuador', 'USD', 0.52, 205.5, 109.5, 35.8, ST_SetSRID(ST_MakePoint(-78.1834, -1.8312), 4326)),
('GUY', 'Guyana', 'GYD', 95.0, 205.5, 109.5, 73.2, ST_SetSRID(ST_MakePoint(-58.9302, 4.8604), 4326)),
('PRY', 'Paraguay', 'PYG', 2850.0, 205.5, 109.5, 37.8, ST_SetSRID(ST_MakePoint(-58.4438, -23.4425), 4326)),
('PER', 'Perú', 'PEN', 1.82, 205.5, 109.5, 20.8, ST_SetSRID(ST_MakePoint(-75.0152, -9.1900), 4326)),
('SUR', 'Surinam', 'SRD', 11.2, 205.5, 109.5, 34.0, ST_SetSRID(ST_MakePoint(-56.0278, 3.9193), 4326)),
('URY', 'Uruguay', 'UYU', 28.5, 205.5, 109.5, 4.5, ST_SetSRID(ST_MakePoint(-55.7658, -32.5228), 4326)),
('VEN', 'Venezuela', 'VES', 8.5, 205.5, 109.5, 11.8, ST_SetSRID(ST_MakePoint(-66.5897, 6.4238), 4326)),
('GUF', 'Guayana Francesa', 'EUR', 0.88, 350.0, 180.0, 15.0, ST_SetSRID(ST_MakePoint(-53.1258, 3.9339), 4326))
ON CONFLICT (code) DO NOTHING;
