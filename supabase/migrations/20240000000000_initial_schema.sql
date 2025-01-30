-- Create tables for the Japanese vocabulary app
create table public.chapters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.vocabulary (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references public.chapters(id) on delete cascade,
  reading text not null,
  meaning text not null,
  kanji text,
  writing_system text not null check (writing_system in ('hiragana', 'katakana')),
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.chapters enable row level security;
alter table public.vocabulary enable row level security;

-- Create policies
create policy "Users can create their own chapters"
  on public.chapters for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own chapters"
  on public.chapters for select
  using (auth.uid() = user_id);

create policy "Users can update their own chapters"
  on public.chapters for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chapters"
  on public.chapters for delete
  using (auth.uid() = user_id);

create policy "Users can create vocabulary in their chapters"
  on public.vocabulary for insert
  with check (auth.uid() = user_id);

create policy "Users can view vocabulary in their chapters"
  on public.vocabulary for select
  using (auth.uid() = user_id);

create policy "Users can update their vocabulary"
  on public.vocabulary for update
  using (auth.uid() = user_id);

create policy "Users can delete their vocabulary"
  on public.vocabulary for delete
  using (auth.uid() = user_id);