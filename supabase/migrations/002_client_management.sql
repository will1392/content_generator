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

-- Create project_contents table (replaces the simple projects table)
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

-- Create auto_saves table for tracking save history
CREATE TABLE IF NOT EXISTS auto_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES project_contents(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrate existing projects data if needed
INSERT INTO clients (name, email, created_at)
SELECT DISTINCT 
  'Default Client' as name,
  'default@example.com' as email,
  MIN(created_at) as created_at
FROM projects
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Default Client');

-- Create indices for performance
CREATE INDEX idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX idx_project_contents_client_project_id ON project_contents(client_project_id);
CREATE INDEX idx_project_contents_stage ON project_contents(stage);
CREATE INDEX idx_auto_saves_content_id ON auto_saves(content_id);

-- Add RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_saves ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable all operations for authenticated users" ON clients
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON client_projects
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON project_contents
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON auto_saves
  FOR ALL USING (true);