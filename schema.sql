-- PostgreSQL-ready schema for Milestone 1: Data Collection & Risk Profiling
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(60) NOT NULL DEFAULT 'inspector',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(180) NOT NULL,
  site_type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  organization VARCHAR(180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id),
  inspector_id UUID NOT NULL REFERENCES users(id),
  inspection_type VARCHAR(100) NOT NULL,
  image_url TEXT,
  description TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(30) NOT NULL DEFAULT 'open'
);

CREATE TABLE detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  object_name VARCHAR(120) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  bounding_box JSONB NOT NULL
);

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  risk_type VARCHAR(120) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  description TEXT,
  recommended_action TEXT
);

CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  compliance_score DECIMAL(5,2) NOT NULL CHECK (compliance_score BETWEEN 0 AND 100),
  status VARCHAR(30) NOT NULL
);

CREATE INDEX inspections_site_timestamp_idx ON inspections(site_id, timestamp DESC);
CREATE INDEX risks_inspection_idx ON risks(inspection_id);
CREATE INDEX compliance_records_inspection_idx ON compliance_records(inspection_id);
