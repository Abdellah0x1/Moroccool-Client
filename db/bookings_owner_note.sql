alter table public.bookings
  add column if not exists owner_note text,
  add column if not exists status_updated_at timestamptz,
  add column if not exists status_updated_by uuid references auth.users(id) on delete set null;
