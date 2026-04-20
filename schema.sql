CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'agent')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  planting_date DATE NOT NULL,
  current_stage VARCHAR(20) CHECK (current_stage IN ('planted', 'growing', 'ready', 'harvested')) NOT NULL DEFAULT 'planted',
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE field_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  updated_by UUID REFERENCES users(id) NOT NULL,
  stage VARCHAR(20) CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
