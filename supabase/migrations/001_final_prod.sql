-- ============================================================
-- WITHH.ME — Final Production Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type public.user_role as enum ('customer', 'partner', 'admin');
create type public.booking_status as enum (
  'pending', 'confirmed', 'partner_assigned', 'in_progress', 'completed', 'cancelled', 'disputed'
);

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- PARTNERS_META ----------
create table public.partners_meta (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  video_url text,
  languages text[] not null default '{}',
  categories text[] not null default '{}',
  hourly_rate numeric(10,2),
  is_guarantor_verified boolean not null default false,
  background_check_status text not null default 'pending',
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- BOOKINGS ----------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  partner_id uuid references public.profiles(id) on delete set null,
  category text not null,
  principal_name text not null,
  exact_meeting_spot text not null,
  meeting_lat numeric,
  meeting_lng numeric,
  scheduled_at timestamptz not null,
  duration_estimate_minutes integer not null default 60,
  requires_female_partner boolean not null default false,
  status public.booking_status not null default 'pending',
  total_price numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MESSAGES (native Realtime chat) ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_bookings_customer on public.bookings(customer_id);
create index idx_bookings_partner on public.bookings(partner_id);
create index idx_messages_booking on public.messages(booking_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.partners_meta enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;

-- profiles: owner can read/update their own row; partner rows are
-- publicly readable so customers can browse Support Partners
create policy "Owner can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Partner profiles are publicly viewable"
  on public.profiles for select
  using (role = 'partner');

create policy "Owner can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- partners_meta: publicly readable (browsing), owner-writable
create policy "Partner meta is publicly viewable"
  on public.partners_meta for select
  using (true);

create policy "Partner can manage own meta"
  on public.partners_meta for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- bookings: strictly scoped to the two participants
create policy "Customer can view own bookings"
  on public.bookings for select
  using (auth.uid() = customer_id);

create policy "Partner can view assigned bookings"
  on public.bookings for select
  using (auth.uid() = partner_id);

create policy "Customer can create bookings"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "Customer can update own bookings"
  on public.bookings for update
  using (auth.uid() = customer_id);

create policy "Partner can update assigned bookings"
  on public.bookings for update
  using (auth.uid() = partner_id);

create policy "Admins manage all bookings"
  on public.bookings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- messages: only the two participants on the parent booking
create policy "Participants can view booking messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
      and (b.customer_id = auth.uid() or b.partner_id = auth.uid())
    )
  );

create policy "Participants can send booking messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
      and (b.customer_id = auth.uid() or b.partner_id = auth.uid())
    )
  );
