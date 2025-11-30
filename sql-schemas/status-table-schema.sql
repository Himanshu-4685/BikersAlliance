-- Status table schema for upcoming and new launch bikes/scooters
-- This table will track the launch status of different bike variants

CREATE TABLE public.status (
  status_id integer NOT NULL DEFAULT nextval('status_status_id_seq'::regclass),
  brand_id uuid NOT NULL,
  model_id integer NOT NULL,
  variant_id integer NOT NULL,
  status text NOT NULL CHECK (status IN ('upcoming', 'new_launch')),
  price_range text, -- e.g., "2.77 - 3.20 Lakh"
  expected_launch date, -- Expected launch date
  launch_date date, -- Actual launch date (for new_launch status)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT status_pkey PRIMARY KEY (status_id),
  CONSTRAINT status_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id),
  CONSTRAINT status_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(model_id),
  CONSTRAINT status_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id),
  
  -- Ensure only one status record per variant
  CONSTRAINT status_variant_unique UNIQUE (variant_id)
);

-- Create sequence for status_id
CREATE SEQUENCE IF NOT EXISTS public.status_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set ownership of sequence
ALTER SEQUENCE public.status_status_id_seq OWNED BY public.status.status_id;

-- Create indexes for better performance
CREATE INDEX idx_status_brand_id ON public.status(brand_id);
CREATE INDEX idx_status_model_id ON public.status(model_id);
CREATE INDEX idx_status_variant_id ON public.status(variant_id);
CREATE INDEX idx_status_status ON public.status(status);
CREATE INDEX idx_status_expected_launch ON public.status(expected_launch);

-- Add comments for documentation
COMMENT ON TABLE public.status IS 'Tracks launch status of bike variants - upcoming or new_launch';
COMMENT ON COLUMN public.status.status IS 'Launch status: upcoming or new_launch';
COMMENT ON COLUMN public.status.price_range IS 'Expected or actual price range as string';
COMMENT ON COLUMN public.status.expected_launch IS 'Expected launch date for upcoming bikes';
COMMENT ON COLUMN public.status.launch_date IS 'Actual launch date for new_launch bikes';