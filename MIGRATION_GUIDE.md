# Running Supabase Migration: `20251122115852_create-lessons-v2-table.sql`

This guide provides detailed steps to run the migration that creates the `lessons_v2` and `questions_v2` tables, along with the `question-images-v2` storage bucket.

## Prerequisites

- Docker Desktop installed and running (or ability to start it)
- Supabase CLI installed
- Authenticated with Supabase (`supabase login`)
- Conda/Miniconda installed (for the automated script)

---

## Method 1: Using the Automated Script (Recommended)

The easiest way is to use the provided script that handles all the setup automatically.

### Step 1: Navigate to Project Root
```bash
cd /Users/jay/code/polariz_therapy/polar-mind-connect
```

### Step 2: Make Script Executable (if not already)
```bash
chmod +x deployment_scripts/run_supabase_migrations.sh
```

### Step 3: Run the Migration Script
```bash
./deployment_scripts/run_supabase_migrations.sh
```

### What the Script Does:
1. ✅ Checks and activates conda environment `polariz_env`
2. ✅ Verifies Supabase CLI is installed
3. ✅ Checks Supabase authentication
4. ✅ Links to project `polariz-ai-speech` if needed
5. ✅ **Starts Docker Desktop if not running**
6. ✅ **Checks port 54322 and kills conflicting processes**
7. ✅ **Starts Supabase locally**
8. ✅ Runs all pending migrations (including your new one)
9. ✅ Shows detailed debug output

### Expected Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  Running Supabase Migrations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Using existing conda environment 'polariz_env'.
✅ Conda environment activated
✅ Supabase CLI found
📋 Found X migration file(s)
✅ Authenticated with Supabase
✅ Project is linked to remote: gsnsjrfudxyczpldbkzc
🐳 Checking Docker status...
✅ Docker is running
🔍 Checking port 54322...
✅ Port 54322 is available
🚀 Starting Supabase...
✅ Supabase is ready
🚀 Running migrations with debug output...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Migrations completed successfully!
```

---

## Method 2: Using Supabase CLI Directly

If you prefer to run migrations manually:

### Step 1: Ensure Docker is Running
```bash
# Check Docker status
docker info

# If not running, start Docker Desktop (macOS)
open -a Docker

# Wait for Docker to be ready (check every few seconds)
docker info
```

### Step 2: Check Port 54322
```bash
# Check if port 54322 is in use
lsof -i :54322

# If something else is using it, kill the process
# (Replace PID with the actual process ID)
kill -9 <PID>
```

### Step 3: Start Supabase (if not already running)
```bash
# Navigate to project root
cd /Users/jay/code/polariz_therapy/polar-mind-connect

# Check if Supabase is running
supabase status

# If not running, start it
supabase start
```

### Step 4: Verify You're Linked to the Correct Project
```bash
# Check current project link
supabase projects list

# If not linked, link to your project
supabase link --project-ref gsnsjrfudxyczpldbkzc
```

### Step 5: Run Migrations
```bash
# Run all pending migrations
supabase migration up

# Or run with debug output for more details
supabase migration up --debug
```

### Step 6: Verify Migration Success
```bash
# Check Supabase status
supabase status

# Or check the database directly
supabase db diff
```

---

## Method 3: Manual SQL Execution (Fallback)

If CLI methods fail, you can run the SQL directly in the Supabase Dashboard:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `polariz-ai-speech`
3. Navigate to **SQL Editor**

### Step 2: Copy Migration SQL
Copy the entire contents of:
```
supabase/migrations/20251122115852_create-lessons-v2-table.sql
```

### Step 3: Execute SQL
1. Paste the SQL into the SQL Editor
2. Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux)
3. Check for any errors in the output

### Step 4: Verify Tables Were Created
Run this query to verify:
```sql
-- Check if lessons_v2 table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lessons_v2', 'questions_v2');

-- Check if storage bucket exists
SELECT name 
FROM storage.buckets 
WHERE id = 'question-images-v2';
```

---

## What This Migration Creates

### 1. Tables
- **`lessons_v2`**: Stores lesson information
  - Columns: `id`, `name`, `description`, `question_type`, `level`, `is_verified`, `youtube_video_id`, `created_at`, `updated_at`
  - Indexes on: `question_type`, `level`, `is_verified`
  - Auto-updating `updated_at` trigger

- **`questions_v2`**: Stores question data
  - Columns: `id`, `question_text`, `answer`, `answer_index`, `question_image`, `choices_text`, `choices_image`, `created_at`, `updated_at`, `created_by`, `question_type`, `lesson_id`, `question_index`
  - Foreign key to `lessons_v2(id)` with CASCADE delete
  - Indexes on: `lesson_id`, `question_type`, `created_by`, and composite `(lesson_id, question_index)`
  - Auto-updating `updated_at` trigger

### 2. Row Level Security (RLS) Policies
- **lessons_v2**:
  - Authenticated users can read verified lessons
  - Content creators can insert/update their own lessons
  - Admins have full access

- **questions_v2**:
  - Authenticated users can read questions from verified lessons
  - Content creators can insert/update/delete their own questions
  - Admins have full access

### 3. Storage Bucket
- **`question-images-v2`**: Public bucket for storing question images
  - Public read access
  - Authenticated users can upload/update/delete

---

## Troubleshooting

### Error: "Docker is not running"
**Solution**: Start Docker Desktop manually or let the script start it automatically.

### Error: "Port 54322 is already in use"
**Solution**: The script will automatically kill the conflicting process. If it fails, manually kill it:
```bash
lsof -ti :54322 | xargs kill -9
```

### Error: "Migration failed: relation already exists"
**Solution**: The table/bucket already exists. Check if you've run this migration before:
```bash
# Check migration history
supabase migration list
```

### Error: "Function update_updated_at_column() does not exist"
**Solution**: The migration creates this function, but if it fails, you may need to run earlier migrations first. Check migration order.

### Error: "Permission denied" or RLS policy errors
**Solution**: Ensure you're authenticated and have the correct role:
```bash
# Check your authentication
supabase projects list

# Verify you're linked to the correct project
cat .supabase/config.toml
```

---

## Verifying Migration Success

After running the migration, verify everything was created correctly:

```sql
-- 1. Check tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('lessons_v2', 'questions_v2');

-- 2. Check indexes
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('lessons_v2', 'questions_v2')
ORDER BY tablename, indexname;

-- 3. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('lessons_v2', 'questions_v2')
ORDER BY tablename, policyname;

-- 4. Check storage bucket
SELECT id, name, public
FROM storage.buckets
WHERE id = 'question-images-v2';

-- 5. Check storage policies
SELECT policyname
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%question-images-v2%';
```

---

## Next Steps

After successful migration:
1. ✅ Tables `lessons_v2` and `questions_v2` are ready to use
2. ✅ Storage bucket `question-images-v2` is available for image uploads
3. ✅ RLS policies are active and protecting data access
4. ✅ You can now start using these tables in your application

---

## Need Help?

If you encounter issues:
1. Check the debug output from `supabase migration up --debug`
2. Review the Supabase logs: `supabase logs`
3. Verify Docker is running: `docker ps`
4. Check Supabase status: `supabase status`

