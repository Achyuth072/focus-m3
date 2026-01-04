-- Kanso Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES TABLE (Extends Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 2. PROJECTS TABLE (Lists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#D0BCFF',
  view_style TEXT DEFAULT 'list' CHECK (view_style IN ('list', 'board')),
  is_inbox BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 3. TASKS TABLE (The Core)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  description TEXT,
  priority INT DEFAULT 4 CHECK (priority BETWEEN 1 AND 4),
  due_date TIMESTAMPTZ,
  do_date TIMESTAMPTZ,
  is_evening BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  day_order INT DEFAULT 0,
  recurrence JSONB,
  google_event_id TEXT,
  google_etag TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 4. LABELS TABLE (Tags)
-- =============================================================================
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#D0BCFF',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 5. TASK_LABELS TABLE (Join Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (task_id, label_id)
);

-- =============================================================================
-- 6. FOCUS_LOGS TABLE (TimeNoder Data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS focus_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 7. TRIGGERS: Auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 8. TRIGGER: Create Profile and Inbox on User Signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile (use ON CONFLICT to avoid duplicates)
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default Inbox project (only if not exists)
  INSERT INTO public.projects (user_id, name, is_inbox)
  SELECT NEW.id, 'Inbox', true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.projects WHERE user_id = NEW.id AND is_inbox = true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.projects TO supabase_auth_admin;

-- Create trigger (note: cannot use OR REPLACE with triggers in PostgreSQL)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks: Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      project_id IS NULL 
      OR EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      project_id IS NULL 
      OR EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Labels: Users can only access their own labels
CREATE POLICY "Users can view own labels" ON labels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- Task Labels: Access through task ownership AND label ownership
CREATE POLICY "Users can view own task_labels" ON task_labels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own task_labels" ON task_labels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
    AND
    EXISTS (SELECT 1 FROM labels WHERE labels.id = task_labels.label_id AND labels.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own task_labels" ON task_labels
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
  );

-- Focus Logs: Users can only access their own logs
CREATE POLICY "Users can view own focus_logs" ON focus_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own focus_logs" ON focus_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      task_id IS NULL 
      OR EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can update own focus_logs" ON focus_logs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      task_id IS NULL 
      OR EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can delete own focus_logs" ON focus_logs
  FOR DELETE USING (auth.uid() = user_id);
