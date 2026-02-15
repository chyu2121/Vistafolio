-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create Table
create table public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default auth.uid(), -- user_id links to auth.users
  ticker text not null,
  amount numeric not null default 0,
  buy_price numeric not null default 0,
  currency text check (currency in ('KRW', 'USD')) default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table portfolios;

-- RLS Policies (Optional but recommended)
alter table portfolios enable row level security;

create policy "Users can view their own portfolios"
  on portfolios for select
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolios"
  on portfolios for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own portfolios"
  on portfolios for update
  using (auth.uid() = user_id);

create policy "Users can delete their own portfolios"
  on portfolios for delete
  using (auth.uid() = user_id);
