-- Update the leads table to support the new status values
-- This script updates the status constraints for the leads table

-- First, remove the existing constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add the new constraint with updated status values
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
CHECK (status = ANY (ARRAY[
  'new'::text, 
  'pending'::text, 
  'done'::text, 
  'quote_given'::text, 
  'canceled'::text
]));

-- Update any existing records that might have old status values
-- Convert 'contacted' to 'pending', 'qualified' to 'quote_given', 'closed' to 'done'
UPDATE public.leads 
SET status = CASE 
  WHEN status = 'contacted' THEN 'pending'
  WHEN status = 'qualified' THEN 'quote_given' 
  WHEN status = 'closed' THEN 'done'
  ELSE status
END
WHERE status IN ('contacted', 'qualified', 'closed');

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add admin_notes column if it doesn't exist (for admin comments on leads)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add assigned_to column if it doesn't exist (for assigning leads to admin users)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_to uuid,
ADD CONSTRAINT leads_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.admin(id);