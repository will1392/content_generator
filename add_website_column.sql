-- Add missing website column to client_projects table
ALTER TABLE client_projects 
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
EOF < /dev/null