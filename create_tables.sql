-- Run this SQL script in your Supabase SQL Editor to create the necessary tables

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  industry VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create client_projects table
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_contents table
CREATE TABLE IF NOT EXISTS project_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  content_name VARCHAR(255) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  stage VARCHAR(50) DEFAULT 'research',
  stage_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create auto_saves table
CREATE TABLE IF NOT EXISTS auto_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES project_contents(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_contents_client_project_id ON project_contents(client_project_id);
CREATE INDEX IF NOT EXISTS idx_project_contents_stage ON project_contents(stage);
CREATE INDEX IF NOT EXISTS idx_auto_saves_content_id ON auto_saves(content_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_saves ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your auth setup)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Enable all operations for authenticated users') THEN
    CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_projects' AND policyname = 'Enable all operations for authenticated users') THEN
    CREATE POLICY "Enable all operations for authenticated users" ON client_projects FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_contents' AND policyname = 'Enable all operations for authenticated users') THEN
    CREATE POLICY "Enable all operations for authenticated users" ON project_contents FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'auto_saves' AND policyname = 'Enable all operations for authenticated users') THEN
    CREATE POLICY "Enable all operations for authenticated users" ON auto_saves FOR ALL USING (true);
  END IF;
END $$;