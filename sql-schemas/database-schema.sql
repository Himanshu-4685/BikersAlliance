-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Admin (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  phone character varying,
  role character varying DEFAULT 'buyer'::character varying,
  Profile_image_url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Admin_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  phone character varying,
  role character varying NOT NULL DEFAULT 'admin'::character varying CHECK (role::text = ANY (ARRAY['super_admin'::character varying, 'admin'::character varying, 'editor'::character varying]::text[])),
  profile_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT admin_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  action character varying NOT NULL,
  table_name character varying,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin(id)
);
CREATE TABLE public.bookings (
  booking_id integer NOT NULL DEFAULT nextval('bookings_booking_id_seq'::regclass),
  user_id integer,
  variant_id integer,
  dealer_id integer,
  booking_date timestamp with time zone,
  status text,
  price numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (booking_id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT bookings_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id),
  CONSTRAINT bookings_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(dealer_id)
);
CREATE TABLE public.brands (
  brand_id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_name character varying NOT NULL,
  logo_url text,
  country character varying,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (brand_id)
);
CREATE TABLE public.comparisons (
  comparison_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint,
  variant_id_1 bigint NOT NULL,
  variant_id_2 bigint NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT comparisons_pkey PRIMARY KEY (comparison_id),
  CONSTRAINT comparisons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT comparisons_variant_id_1_fkey FOREIGN KEY (variant_id_1) REFERENCES public.variants(variant_id),
  CONSTRAINT comparisons_variant_id_2_fkey FOREIGN KEY (variant_id_2) REFERENCES public.variants(variant_id)
);
CREATE TABLE public.dealers (
  dealer_id integer NOT NULL DEFAULT nextval('dealers_dealer_id_seq'::regclass),
  name text NOT NULL,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dealers_pkey PRIMARY KEY (dealer_id)
);
CREATE TABLE public.favourites (
  favourite_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  variant_id bigint NOT NULL,
  added_at timestamp without time zone DEFAULT now(),
  CONSTRAINT favourites_pkey PRIMARY KEY (favourite_id),
  CONSTRAINT favourites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT favourites_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id)
);
CREATE TABLE public.images (
  image_id integer NOT NULL DEFAULT nextval('images_image_id_seq'::regclass),
  variant_id integer,
  url text,
  alt_text text,
  CONSTRAINT images_pkey PRIMARY KEY (image_id),
  CONSTRAINT images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id)
);
CREATE TABLE public.models (
  model_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  brand_id uuid NOT NULL,
  model_name text,
  CONSTRAINT models_pkey PRIMARY KEY (model_id),
  CONSTRAINT models_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  author text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_published boolean DEFAULT false,
  category text DEFAULT 'General'::text,
  featured boolean DEFAULT false,
  CONSTRAINT news_pkey PRIMARY KEY (id)
);
CREATE TABLE public.newsletter_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'unsubscribed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reviews (
  review_id integer NOT NULL DEFAULT nextval('reviews_review_id_seq'::regclass),
  variant_id integer,
  user_id integer,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT reviews_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.specs (
  variant_id integer NOT NULL,
  engine_type text,
  displacement text,
  max_torque text,
  no_of_cylinders text,
  cooling_system text,
  valve_per_cylinder text,
  starting text,
  fuel_supply text,
  clutch text,
  ignition text,
  gear_box text,
  bore text,
  stroke text,
  compression_ratio text,
  city_mileage text,
  highway_mileage text,
  body_type text,
  zero_to_hundred text,
  peak_power text,
  transmission text,
  other_features jsonb,
  CONSTRAINT specs_pkey PRIMARY KEY (variant_id),
  CONSTRAINT specs_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id)
);
CREATE TABLE public.status (
  status_id integer NOT NULL DEFAULT nextval('status_status_id_seq'::regclass),
  brand_id uuid NOT NULL,
  model_id bigint NOT NULL,
  variant_id integer NOT NULL UNIQUE,
  status text NOT NULL CHECK (status = ANY (ARRAY['upcoming'::text, 'new_launch'::text])),
  price_range text,
  expected_launch date,
  launch_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT status_pkey PRIMARY KEY (status_id),
  CONSTRAINT status_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id),
  CONSTRAINT status_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id),
  CONSTRAINT status_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(model_id)
);
CREATE TABLE public.used_bikes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand character varying NOT NULL,
  model character varying NOT NULL,
  variant character varying,
  year integer NOT NULL,
  category character varying NOT NULL,
  fuel_type character varying NOT NULL,
  transmission character varying NOT NULL,
  km_driven integer NOT NULL,
  ownership character varying NOT NULL,
  expected_price integer NOT NULL,
  condition character varying NOT NULL CHECK (condition::text = ANY (ARRAY['Excellent'::character varying, 'Good'::character varying, 'Fair'::character varying]::text[])),
  description text,
  owner_name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying NOT NULL,
  city character varying NOT NULL,
  state character varying NOT NULL,
  has_rc boolean DEFAULT false,
  has_insurance boolean DEFAULT false,
  has_puc boolean DEFAULT false,
  photos jsonb DEFAULT '[]'::jsonb,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'sold'::character varying]::text[])),
  admin_notes text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  sold_at timestamp with time zone,
  CONSTRAINT used_bikes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  full_name text,
  email text NOT NULL UNIQUE,
  password_hash text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  Img_url character varying,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.variants (
  variant_id integer NOT NULL DEFAULT nextval('variants_variant_id_seq'::regclass),
  model_id bigint NOT NULL,
  brand_id uuid NOT NULL,
  variant_name text NOT NULL,
  on_road_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  url character varying,
  CONSTRAINT variants_pkey PRIMARY KEY (variant_id),
  CONSTRAINT variants_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id),
  CONSTRAINT variants_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(model_id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  video_url text,
  thumbnail_url text,
  source text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_published boolean DEFAULT false,
  category text DEFAULT 'General'::text,
  featured boolean DEFAULT false,
  duration text,
  views text DEFAULT '0'::text,
  CONSTRAINT videos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.web_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_image_url text,
  pages jsonb,
  author text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_published boolean DEFAULT false,
  category text DEFAULT 'General'::text,
  featured boolean DEFAULT false,
  description text,
  CONSTRAINT web_stories_pkey PRIMARY KEY (id)
);