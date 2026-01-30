-- Update comparisons table to support up to 6 variants and make them optional
-- First, drop the existing foreign key constraints that we need to modify
ALTER TABLE public.comparisons 
DROP CONSTRAINT IF EXISTS comparisons_variant_id_3_fkey,
DROP CONSTRAINT IF EXISTS comparisons_variant_id_4_fkey;

-- Modify existing columns to be nullable (optional)
ALTER TABLE public.comparisons 
ALTER COLUMN variant_id_3 DROP NOT NULL,
ALTER COLUMN variant_id_4 DROP NOT NULL,
ALTER COLUMN variant_id_4 TYPE bigint; -- Change from integer to bigint for consistency

-- Add new optional variant columns for 5th and 6th comparisons
ALTER TABLE public.comparisons 
ADD COLUMN IF NOT EXISTS variant_id_5 bigint,
ADD COLUMN IF NOT EXISTS variant_id_6 bigint;

-- Add name/title column for saved comparisons
ALTER TABLE public.comparisons 
ADD COLUMN IF NOT EXISTS comparison_name text DEFAULT 'My Comparison';

-- Recreate foreign key constraints for all variant columns
ALTER TABLE public.comparisons 
ADD CONSTRAINT comparisons_variant_id_3_fkey FOREIGN KEY (variant_id_3) REFERENCES public.variants(variant_id),
ADD CONSTRAINT comparisons_variant_id_4_fkey FOREIGN KEY (variant_id_4) REFERENCES public.variants(variant_id),
ADD CONSTRAINT comparisons_variant_id_5_fkey FOREIGN KEY (variant_id_5) REFERENCES public.variants(variant_id),
ADD CONSTRAINT comparisons_variant_id_6_fkey FOREIGN KEY (variant_id_6) REFERENCES public.variants(variant_id);

-- Add a check constraint to ensure at least 2 variants are provided
ALTER TABLE public.comparisons 
ADD CONSTRAINT check_at_least_two_variants CHECK (
  variant_id_1 IS NOT NULL AND variant_id_2 IS NOT NULL
);

-- Create an index for better query performance on user_id
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON public.comparisons(user_id);

-- Update the table comment
COMMENT ON TABLE public.comparisons IS 'Stores user saved bike comparisons with up to 6 variants';