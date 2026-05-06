-- CompraFácil IA - Supabase Schema

create extension if not exists "pgcrypto";

-- Households (Family Mode)
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  invite_code text unique,
  created_at timestamptz default now()
);

-- User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  household_id uuid references public.households(id) on delete set null,
  accessibility_mode boolean default false,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Household Members
create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  unique(household_id, user_id)
);

-- Shopping Lists
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  name text not null,
  status text default 'active',
  market_name text,
  estimated_total numeric default 0,
  real_total numeric default 0,
  savings_total numeric default 0,
  economy_score numeric default 0,
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- Shopping Items
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.shopping_lists(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  name text not null,
  category text default 'Outros',
  quantity numeric default 1,
  unit text,
  brand text,
  estimated_price numeric default 0,
  paid_price numeric default 0,
  normal_price numeric default 0,
  promo_price numeric default 0,
  market_name text,
  is_checked boolean default false,
  is_promotion boolean default false,
  club_name text,
  image_url text,
  notes text,
  created_at timestamptz default now()
);

-- Home Inventory
create table if not exists public.home_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  name text not null,
  category text default 'Outros',
  current_quantity numeric default 0,
  minimum_quantity numeric default 0,
  unit text,
  expiration_date date,
  notes text,
  created_at timestamptz default now()
);

-- Price History
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  product_name text not null,
  brand text,
  category text,
  market_name text,
  normal_price numeric default 0,
  promo_price numeric default 0,
  paid_price numeric default 0,
  club_name text,
  purchase_date date default current_date,
  created_at timestamptz default now()
);

-- AI Scans
create table if not exists public.ai_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  image_url text,
  scan_type text,
  extracted_json jsonb,
  confidence numeric,
  created_at timestamptz default now()
);

-- Receipts
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  market_name text,
  receipt_date date,
  total_amount numeric default 0,
  image_url text,
  extracted_json jsonb,
  created_at timestamptz default now()
);

-- Receipt Items
create table if not exists public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references public.receipts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  brand text,
  category text,
  quantity numeric default 1,
  unit text,
  paid_price numeric default 0,
  created_at timestamptz default now()
);

-- Price Alerts
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_name text not null,
  target_price numeric,
  current_price numeric,
  market_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.home_inventory enable row level security;
alter table public.price_history enable row level security;
alter table public.ai_scans enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;
alter table public.price_alerts enable row level security;

-- Policies

-- Profiles: User can only see/edit their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "System can insert profile" on public.profiles for insert with check (auth.uid() = id);

-- Households: Owner or Member access
create policy "Users can view households they belong to" on public.households for select
using (owner_id = auth.uid() or exists (select 1 from public.household_members where household_id = public.households.id and user_id = auth.uid()));

create policy "Owners can update households" on public.households for update
using (owner_id = auth.uid());

-- Lists, Items, Inventory, etc (Owner or Household Member access)
create policy "Shopping lists access" on public.shopping_lists for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.shopping_lists.household_id and user_id = auth.uid())));

create policy "Shopping items access" on public.shopping_items for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.shopping_items.household_id and user_id = auth.uid())));

create policy "Inventory access" on public.home_inventory for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.home_inventory.household_id and user_id = auth.uid())));

create policy "Price history access" on public.price_history for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.price_history.household_id and user_id = auth.uid())));

create policy "AI Scans access" on public.ai_scans for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.ai_scans.household_id and user_id = auth.uid())));

create policy "Receipts access" on public.receipts for all
using (user_id = auth.uid() or (household_id is not null and exists (select 1 from public.household_members where household_id = public.receipts.household_id and user_id = auth.uid())));

create policy "Price alerts access" on public.price_alerts for all
using (user_id = auth.uid());

-- Function to handle profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security modeller;
