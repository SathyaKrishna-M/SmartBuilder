-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Create policy: Users can only see their own projects
create policy "Users can view their own projects"
  on public.projects
  for select
  using (auth.uid() = user_id);

-- Create policy: Allow public read access for shared projects (optional - for share links)
-- Uncomment if you want public share functionality
-- create policy "Public can view projects by id"
--   on public.projects
--   for select
--   using (true);

-- Create policy: Users can insert their own projects
create policy "Users can insert their own projects"
  on public.projects
  for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can update their own projects
create policy "Users can update their own projects"
  on public.projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own projects
create policy "Users can delete their own projects"
  on public.projects
  for delete
  using (auth.uid() = user_id);

-- Create index on user_id for faster queries
create index if not exists projects_user_id_idx on public.projects(user_id);

-- Create index on updated_at for sorting
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

