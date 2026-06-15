create table if not exists public.restaurant_bookings (
  id bigserial primary key,
  restaurant_id bigint not null references public.etablissement(id) on delete cascade,
  business_id bigint references public.businesses(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  requested_date date not null,
  requested_time time not null,
  guests integer not null check (guests between 1 and 20),
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'rejected', 'cancelled')
  ),
  occasion text,
  notes text,
  owner_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists restaurant_bookings_restaurant_date_idx
  on public.restaurant_bookings (restaurant_id, requested_date, requested_time);

create index if not exists restaurant_bookings_user_idx
  on public.restaurant_bookings (user_id, created_at desc);

alter table public.restaurant_bookings enable row level security;

drop policy if exists "Users can create their own restaurant bookings"
  on public.restaurant_bookings;
create policy "Users can create their own restaurant bookings"
  on public.restaurant_bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own restaurant bookings"
  on public.restaurant_bookings;
create policy "Users can read their own restaurant bookings"
  on public.restaurant_bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Business owners can read bookings for their restaurant"
  on public.restaurant_bookings;
create policy "Business owners can read bookings for their restaurant"
  on public.restaurant_bookings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      join public.etablissement e on e.business_id = b.id
      where e.id = restaurant_bookings.restaurant_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "Business owners can update bookings for their restaurant"
  on public.restaurant_bookings;
create policy "Business owners can update bookings for their restaurant"
  on public.restaurant_bookings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      join public.etablissement e on e.business_id = b.id
      where e.id = restaurant_bookings.restaurant_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      join public.etablissement e on e.business_id = b.id
      where e.id = restaurant_bookings.restaurant_id
        and b.owner_id = auth.uid()
    )
  );
