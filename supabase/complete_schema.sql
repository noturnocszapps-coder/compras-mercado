-- ====================================================
-- COMPRA FÁCIL BY ROXOU - ARCHITECTURE SQL (SUPABASE)
-- Version: 2.0.0 (Production Ready)
-- ====================================================

-- 0. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. ENUMS
do $$ begin
    create type public.app_role as enum ('user', 'admin', 'moderator');
    create type public.subscription_plan as enum ('free', 'premium_monthly', 'premium_yearly', 'family');
    create type public.subscription_status as enum ('active', 'inactive', 'canceled', 'past_due', 'trialing');
    create type public.list_status as enum ('active', 'finished', 'archived');
    create type public.household_role as enum ('owner', 'admin', 'member');
    create type public.item_category as enum (
        'Higiene', 'Limpeza', 'Alimentos', 'Bebidas', 'Carnes', 
        'Laticínios', 'Hortifruti', 'Padaria', 'Congelados', 
        'Pet Shop', 'Casa', 'Eletrônicos', 'Saúde', 'Outros'
    );
exception
    when duplicate_object then null;
end $$;

-- 2. TABLES

-- 1. Households (Family Mode)
create table if not exists public.households (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    owner_id uuid references auth.users(id) on delete cascade,
    invite_code text unique default substring(upper(md5(random()::text)) from 1 for 8),
    created_at timestamptz default now()
);

-- 2. Profiles (User Metadata)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    email text unique,
    household_id uuid references public.households(id) on delete set null,
    role public.app_role default 'user',
    plan public.subscription_plan default 'free',
    subscription_status public.subscription_status default 'inactive',
    onboarding_completed boolean default false,
    accessibility_mode boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Household Members
create table if not exists public.household_members (
    id uuid primary key default uuid_generate_v4(),
    household_id uuid references public.households(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role public.household_role default 'member',
    joined_at timestamptz default now(),
    unique(household_id, user_id)
);

-- 4. Shopping Lists
create table if not exists public.shopping_lists (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    household_id uuid references public.households(id) on delete cascade,
    name text not null,
    market_name text,
    category text,
    status public.list_status default 'active',
    estimated_total numeric(12,2) default 0,
    real_total numeric(12,2) default 0,
    savings_total numeric(12,2) default 0,
    economy_score numeric(5,2) default 0,
    created_at timestamptz default now(),
    finished_at timestamptz,
    updated_at timestamptz default now()
);

-- 5. Shopping Items
create table if not exists public.shopping_items (
    id uuid primary key default uuid_generate_v4(),
    list_id uuid references public.shopping_lists(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    household_id uuid references public.households(id) on delete cascade,
    name text not null,
    normalized_name text,
    quantity numeric(12,3) default 1,
    unit text default 'un',
    estimated_price numeric(12,2) default 0,
    paid_price numeric(12,2) default 0,
    checked boolean default false,
    category public.item_category default 'Outros',
    barcode text,
    created_at timestamptz default now(),
    checked_at timestamptz,
    updated_at timestamptz default now()
);

-- 6. Home Inventory
create table if not exists public.home_inventory (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    household_id uuid references public.households(id) on delete cascade,
    name text not null,
    quantity numeric(12,3) default 0,
    unit text default 'un',
    category public.item_category default 'Outros',
    expiration_date date,
    minimum_quantity numeric(12,3) default 0,
    current_price numeric(12,2) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 7. Price History
create table if not exists public.price_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    household_id uuid references public.households(id) on delete cascade,
    item_name text not null,
    normalized_name text,
    market_name text,
    price numeric(12,2) not null,
    quantity numeric(12,3) default 1,
    unit text default 'un',
    created_at timestamptz default now()
);

-- 8. App Feedback
create table if not exists public.app_feedback (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    rating integer check (rating >= 1 and rating <= 5),
    message text,
    created_at timestamptz default now()
);

-- 9. Notifications Settings
create table if not exists public.notifications_settings (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade unique,
    low_stock boolean default true,
    expiration_alert boolean default true,
    monthly_reminder boolean default true,
    ai_insights boolean default true,
    created_at timestamptz default now()
);

-- 10. AI Scans
create table if not exists public.ai_scans (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    type text not null, -- 'receipt', 'shelf', 'product'
    raw_text text,
    parsed_result jsonb,
    confidence numeric(5,2),
    created_at timestamptz default now()
);

-- 11. Subscriptions (Stripe Sync)
create table if not exists public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade unique,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_price_id text,
    plan public.subscription_plan default 'free',
    status public.subscription_status default 'inactive',
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 12. Audit Logs
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    action text not null,
    entity text not null,
    entity_id uuid,
    metadata jsonb,
    created_at timestamptz default now()
);

-- 3. INDEXES
create index if not exists idx_profiles_household_id on public.profiles(household_id);
create index if not exists idx_shopping_lists_user_id on public.shopping_lists(user_id);
create index if not exists idx_shopping_lists_household_id on public.shopping_lists(household_id);
create index if not exists idx_shopping_items_list_id on public.shopping_items(list_id);
create index if not exists idx_home_inventory_household_id on public.home_inventory(household_id);
create index if not exists idx_price_history_normalized_name on public.price_history(normalized_name);
create index if not exists idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);

-- 4. RLS ENABLING
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.home_inventory enable row level security;
alter table public.price_history enable row level security;
alter table public.app_feedback enable row level security;
alter table public.notifications_settings enable row level security;
alter table public.ai_scans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

-- 5. POLICIES

-- Helper Function for Admin Check
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
end;
$$ language plpgsql security definer;

-- Profiles
create policy "Visible to owners and admins" on public.profiles for select using (auth.uid() = id or is_admin());
create policy "Editable by owners and admins" on public.profiles for update using (auth.uid() = id or is_admin());

-- Households & Members
create policy "Household visibility" on public.households for select
using (owner_id = auth.uid() or exists (select 1 from public.household_members where household_id = public.households.id and user_id = auth.uid()));

create policy "Household members access" on public.household_members for all
using (user_id = auth.uid() or exists (select 1 from public.household_members where household_id = public.household_members.household_id and user_id = auth.uid() and role in ('owner', 'admin')));

-- Shopping Lists (Household context)
create policy "Lists access" on public.shopping_lists for all
using (
    user_id = auth.uid() or 
    (household_id is not null and exists (select 1 from public.household_members where household_id = public.shopping_lists.household_id and user_id = auth.uid()))
);

-- Shopping Items
create policy "Items access" on public.shopping_items for all
using (
    user_id = auth.uid() or 
    (household_id is not null and exists (select 1 from public.household_members where household_id = public.shopping_items.household_id and user_id = auth.uid()))
);

-- Inventory
create policy "Inventory access" on public.home_inventory for all
using (
    user_id = auth.uid() or 
    (household_id is not null and exists (select 1 from public.household_members where household_id = public.home_inventory.household_id and user_id = auth.uid()))
);

-- Subscriptions
create policy "Subscription view" on public.subscriptions for select using (auth.uid() = user_id or is_admin());

-- 6. FUNCTIONS & TRIGGERS

-- Updated At
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at_column();
create trigger update_shopping_lists_updated_at before update on public.shopping_lists for each row execute procedure public.update_updated_at_column();
create trigger update_shopping_items_updated_at before update on public.shopping_items for each row execute procedure public.update_updated_at_column();
create trigger update_inventory_updated_at before update on public.home_inventory for each row execute procedure public.update_updated_at_column();

-- New User Handler (Profile + Default Household)
create or replace function public.handle_new_user()
returns trigger as $$
declare
    new_household_id uuid;
begin
    -- Create Default Household for the user
    insert into public.households (name, owner_id)
    values ('Minha Casa', new.id)
    returning id into new_household_id;

    -- Create Household Member record as owner
    insert into public.household_members (household_id, user_id, role)
    values (new_household_id, new.id, 'owner');

    -- Create Profile
    insert into public.profiles (id, full_name, email, avatar_url, household_id)
    values (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.email, 
        new.raw_user_meta_data->>'avatar_url',
        new_household_id
    );

    -- Create Default Notification Settings
    insert into public.notifications_settings (user_id) values (new.id);

    return new;
end;
$$ language plpgsql security definer;

-- Trigger for Auth Signup
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- Inventory Sync after Shopping List finish
create or replace function public.sync_inventory_from_list()
returns trigger as $$
begin
    if new.status = 'finished' and old.status = 'active' then
        -- Insert items from list into inventory or update if exists
        insert into public.home_inventory (user_id, household_id, name, quantity, category, unit)
        select 
            si.user_id, 
            si.household_id, 
            si.name, 
            si.quantity, 
            si.category, 
            si.unit
        from public.shopping_items si
        where si.list_id = new.id and si.checked = true;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger sync_inventory_trigger
    after update on public.shopping_lists
    for each row execute procedure public.sync_inventory_from_list();

-- 7. REALTIME
begin;
  -- drop publication if exists supabase_realtime;
  -- create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.shopping_lists;
alter publication supabase_realtime add table public.shopping_items;
alter publication supabase_realtime add table public.home_inventory;

-- Audit Log Trigger (Sample)
create or replace function public.log_list_actions()
returns trigger as $$
begin
    insert into public.audit_logs (user_id, action, entity, entity_id, metadata)
    values (
        auth.uid(), 
        TG_OP, 
        'shopping_lists', 
        case when TG_OP = 'DELETE' then old.id else new.id end, 
        jsonb_build_object('name', case when TG_OP = 'DELETE' then old.name else new.name end)
    );
    return null;
end;
$$ language plpgsql;

create trigger audit_shopping_lists
    after insert or update or delete on public.shopping_lists
    for each row execute procedure public.log_list_actions();
