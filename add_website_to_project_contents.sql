-- Add missing website column to project_contents table
ALTER TABLE project_contents 
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';