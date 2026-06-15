create table if not exists public.accommodation_booking_details (
  id bigserial primary key,
  booking_id bigint not null unique references public.bookings(id) on delete cascade,
  room_type_id bigint references public.accommodation_room_types(id) on delete set null,
  room_type_name text,
  check_in_date date not null,
  check_out_date date not null,
  guests integer not null check (guests between 1 and 30),
  rooms integer not null check (rooms between 1 and 10),
  arrival_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accommodation_booking_details_booking_idx
  on public.accommodation_booking_details (booking_id);

create index if not exists accommodation_booking_details_dates_idx
  on public.accommodation_booking_details (check_in_date, check_out_date);

alter table public.accommodation_booking_details enable row level security;

drop policy if exists "Users can create their own accommodation booking details"
  on public.accommodation_booking_details;
create policy "Users can create their own accommodation booking details"
  on public.accommodation_booking_details
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bookings b
      where b.id = accommodation_booking_details.booking_id
        and b.user_id = auth.uid()
        and b.type = 'accommodation'
    )
  );

drop policy if exists "Users can read their own accommodation booking details"
  on public.accommodation_booking_details;
create policy "Users can read their own accommodation booking details"
  on public.accommodation_booking_details
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = accommodation_booking_details.booking_id
        and b.user_id = auth.uid()
    )
  );

drop policy if exists "Business owners can read accommodation booking details"
  on public.accommodation_booking_details;
create policy "Business owners can read accommodation booking details"
  on public.accommodation_booking_details
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.businesses business on business.id = b.business_id
      where b.id = accommodation_booking_details.booking_id
        and business.owner_id = auth.uid()
    )
  );
