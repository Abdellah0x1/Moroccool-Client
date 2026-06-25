-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.etablissement (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type text NOT NULL,
  city text NOT NULL,
  description text,
  address text,
  rating real,
  images ARRAY NOT NULL,
  name text NOT NULL,
  website text,
  openingHours jsonb,
  phone text,
  city_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  business_id bigint UNIQUE,
  min_nights integer DEFAULT 1,
  max_guests integer,
  check_in_time time without time zone,
  check_out_time time without time zone,
  google_maps_embed_url text,
  CONSTRAINT etablissement_pkey PRIMARY KEY (id),
  CONSTRAINT etablissement_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.city(id),
  CONSTRAINT etablissement_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.city (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  slug text,
  description text NOT NULL,
  image text NOT NULL,
  CONSTRAINT city_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profile (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text, 'business_owner'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.review (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  place_id bigint NOT NULL,
  user_id uuid NOT NULL,
  rating numeric NOT NULL CHECK (rating > 1::numeric AND rating <= 5::numeric),
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_pkey PRIMARY KEY (id),
  CONSTRAINT review_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.etablissement(id),
  CONSTRAINT review_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.businesses (
  id bigint NOT NULL DEFAULT nextval('bussiness_id_seq'::regclass),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  city text,
  address text NOT NULL,
  status text DEFAULT 'pending_review'::text CHECK (status = ANY (ARRAY['pending_review'::text, 'approved'::text, 'needs_changes'::text, 'rejected'::text])),
  commission_model text NOT NULL DEFAULT 'per_booking'::text CHECK (commission_model = ANY (ARRAY['per_booking'::text, 'percentage'::text, 'subscription'::text])),
  commission_value numeric NOT NULL DEFAULT 0 CHECK (commission_value >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  type text,
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT bussiness_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profile(id)
);
CREATE TABLE public.monthly_invoice (
  id bigint NOT NULL DEFAULT nextval('monthly_invoice_id_seq'::regclass),
  invoice_number text UNIQUE,
  bussiness_id bigint NOT NULL,
  period_month date,
  total_amount numeric NOT NULL DEFAULT 0 CHECK (total_amount > 0::numeric),
  notes text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'disputed'::text, 'void'::text])),
  sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  booking_count integer NOT NULL DEFAULT 0,
  commission_value numeric NOT NULL DEFAULT 0,
  CONSTRAINT monthly_invoice_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_invoice_bussiness_id_fkey FOREIGN KEY (bussiness_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.accommodation_room_types (
  id bigint NOT NULL DEFAULT nextval('accommodation_room_types_id_seq'::regclass),
  etablissement_id bigint NOT NULL,
  name text NOT NULL,
  max_guests integer NOT NULL DEFAULT 2,
  units integer NOT NULL DEFAULT 1,
  base_price numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accommodation_room_types_pkey PRIMARY KEY (id),
  CONSTRAINT accommodation_room_types_etablissement_id_fkey FOREIGN KEY (etablissement_id) REFERENCES public.etablissement(id)
);
CREATE TABLE public.bookings (
  id bigint NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
  type text NOT NULL CHECK (type = ANY (ARRAY['restaurant'::text, 'hotel'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'rejected'::text])),
  user_id uuid NOT NULL,
  business_id bigint,
  etablissement_id bigint NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  customer_note text,
  owner_note text,
  cancellation_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT bookings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT bookings_etablissement_id_fkey FOREIGN KEY (etablissement_id) REFERENCES public.etablissement(id)
);
CREATE TABLE public.restaurant_booking_details (
  booking_id bigint NOT NULL,
  requested_date date NOT NULL,
  requested_time time without time zone NOT NULL,
  guests integer NOT NULL CHECK (guests >= 1 AND guests <= 10),
  CONSTRAINT restaurant_booking_details_pkey PRIMARY KEY (booking_id),
  CONSTRAINT restaurant_booking_details_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.accommodation_availability (
  id bigint NOT NULL DEFAULT nextval('accommodation_availability_id_seq'::regclass),
  room_type_id bigint NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'limited'::text, 'closed'::text])),
  available_units integer NOT NULL CHECK (available_units >= 0),
  min_nights integer NOT NULL DEFAULT 1 CHECK (min_nights >= 1),
  owner_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accommodation_availability_pkey PRIMARY KEY (id),
  CONSTRAINT accommodation_availability_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.accommodation_room_types(id)
);
CREATE TABLE public.accommodation_booking_details (
  booking_id bigint NOT NULL,
  room_type_id bigint,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL CHECK (guests >= 1 AND guests <= 20),
  rooms integer NOT NULL CHECK (rooms >= 1 AND rooms <= 7),
  arrival_time time without time zone,
  quoted_price numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accommodation_booking_details_pkey PRIMARY KEY (booking_id),
  CONSTRAINT accommodation_booking_details_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT accommodation_booking_details_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.accommodation_room_types(id)
);