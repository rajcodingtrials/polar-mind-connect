-- Safe migration to change speech_delay_mode and add_mini_celebration to support three states: 'yes', 'no', 'default'
-- This migration handles both cases: if columns are boolean, convert them; if already TEXT, ensure they have correct defaults

-- Migrate speech_delay_mode from boolean to TEXT
DO $$
BEGIN
    -- Check if speech_delay_mode is boolean type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'speech_delay_mode'
        AND data_type = 'boolean'
    ) THEN
        -- Add new TEXT column
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS speech_delay_mode_new TEXT DEFAULT 'default';
        
        -- Migrate existing boolean values to new TEXT column
        UPDATE public.profiles 
        SET speech_delay_mode_new = CASE 
            WHEN speech_delay_mode = true THEN 'yes'
            WHEN speech_delay_mode = false THEN 'no'
            ELSE 'default'
        END;
        
        -- Set NOT NULL constraint
        ALTER TABLE public.profiles 
        ALTER COLUMN speech_delay_mode_new SET NOT NULL;
        
        -- Drop old boolean column
        ALTER TABLE public.profiles 
        DROP COLUMN speech_delay_mode;
        
        -- Rename new column to original name
        ALTER TABLE public.profiles 
        RENAME COLUMN speech_delay_mode_new TO speech_delay_mode;
    END IF;
    
    -- Ensure the column is TEXT type with correct default and NOT NULL (in case it was already TEXT)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'speech_delay_mode'
        AND data_type = 'text'
    ) THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN speech_delay_mode SET DEFAULT 'default';
        
        -- Only set NOT NULL if it's not already NOT NULL
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'speech_delay_mode'
            AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE public.profiles 
            ALTER COLUMN speech_delay_mode SET NOT NULL;
        END IF;
    END IF;
END $$;

-- Migrate add_mini_celebration from boolean to TEXT
DO $$
BEGIN
    -- Check if add_mini_celebration is boolean type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'add_mini_celebration'
        AND data_type = 'boolean'
    ) THEN
        -- Add new TEXT column
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS add_mini_celebration_new TEXT DEFAULT 'default';
        
        -- Migrate existing boolean values to new TEXT column
        UPDATE public.profiles 
        SET add_mini_celebration_new = CASE 
            WHEN add_mini_celebration = true THEN 'yes'
            WHEN add_mini_celebration = false THEN 'no'
            ELSE 'default'
        END;
        
        -- Set NOT NULL constraint
        ALTER TABLE public.profiles 
        ALTER COLUMN add_mini_celebration_new SET NOT NULL;
        
        -- Drop old boolean column
        ALTER TABLE public.profiles 
        DROP COLUMN add_mini_celebration;
        
        -- Rename new column to original name
        ALTER TABLE public.profiles 
        RENAME COLUMN add_mini_celebration_new TO add_mini_celebration;
    END IF;
    
    -- Ensure the column is TEXT type with correct default and NOT NULL (in case it was already TEXT)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'add_mini_celebration'
        AND data_type = 'text'
    ) THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN add_mini_celebration SET DEFAULT 'default';
        
        -- Only set NOT NULL if it's not already NOT NULL
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'add_mini_celebration'
            AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE public.profiles 
            ALTER COLUMN add_mini_celebration SET NOT NULL;
        END IF;
    END IF;
END $$;

