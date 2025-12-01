# Migration Instructions

## Issue
The database columns `speech_delay_mode` and `add_mini_celebration` are still BOOLEAN type, but the application code expects TEXT type with values 'yes', 'no', or 'default'.

## Solution
Run the migration `20250130000002_change-preferences-to-three-state.sql` or `20250130000003_fix-preferences-to-three-state-safe.sql` to convert the columns from boolean to TEXT.

## Option 1: Using Supabase CLI (Recommended)
```bash
npx supabase db push
```

## Option 2: Manual SQL Execution
If the CLI doesn't work, you can run the migration SQL directly in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250130000003_fix-preferences-to-three-state-safe.sql`
4. Execute the SQL

## Option 3: Quick Fix SQL (Run this directly)
```sql
-- Quick fix: Convert boolean columns to TEXT
ALTER TABLE public.profiles 
ALTER COLUMN speech_delay_mode TYPE TEXT USING 
  CASE 
    WHEN speech_delay_mode = true THEN 'yes'
    WHEN speech_delay_mode = false THEN 'no'
    ELSE 'default'
  END,
ALTER COLUMN speech_delay_mode SET DEFAULT 'default',
ALTER COLUMN speech_delay_mode SET NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN add_mini_celebration TYPE TEXT USING 
  CASE 
    WHEN add_mini_celebration = true THEN 'yes'
    WHEN add_mini_celebration = false THEN 'no'
    ELSE 'default'
  END,
ALTER COLUMN add_mini_celebration SET DEFAULT 'default',
ALTER COLUMN add_mini_celebration SET NOT NULL;
```

