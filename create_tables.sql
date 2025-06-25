-- Content Creation App Database Setup
-- Run this script in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    industry VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Client Projects table
CREATE TABLE IF NOT EXISTS client_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Project Contents table
CREATE TABLE IF NOT EXISTS project_contents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    content_name VARCHAR(255) NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    topical_map_id UUID,
    topical_map_keyword_id VARCHAR(255),
    stage VARCHAR(50) DEFAULT 'research' CHECK (stage IN ('research', 'blog', 'podcast_script', 'audio', 'images', 'social', 'complete')),
    stage_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Topical Maps table
CREATE TABLE IF NOT EXISTS topical_maps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    keywords JSONB DEFAULT '[]',
    total_keywords INTEGER DEFAULT 0,
    completed_keywords INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Auto Saves table (for content history)
CREATE TABLE IF NOT EXISTS auto_saves (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id UUID REFERENCES project_contents(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Legacy Projects table (for backward compatibility)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'research' CHECK (status IN ('research', 'blog', 'podcast_script', 'audio', 'images', 'social', 'complete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Legacy Content Stages table (for backward compatibility)
CREATE TABLE IF NOT EXISTS content_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a demo client to get started (optional)
INSERT INTO clients (name, email, company, industry, notes) VALUES 
('Demo Client', 'demo@example.com', 'Demo Company', 'Technology', 'This is a demo client to get you started')
ON CONFLICT DO NOTHING;