-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- after creating your project. Safe to re-run: uses IF NOT EXISTS
-- where possible and DROP POLICY IF EXISTS before recreating.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists board_members (
  board_id uuid not null references boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member', 'viewer')) default 'member',
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table if not exists board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  column_id uuid not null references board_columns(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Auto-add the creator as admin when a board is created
-- ============================================================

create or replace function public.handle_new_board()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into board_members (board_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

drop trigger if exists on_board_created on boards;
create trigger on_board_created
  after insert on boards
  for each row execute function public.handle_new_board();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table boards enable row level security;
alter table board_members enable row level security;
alter table board_columns enable row level security;
alter table cards enable row level security;

-- Helper: is the current user a member of a given board?
create or replace function public.is_board_member(target_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from board_members
    where board_id = target_board_id and user_id = auth.uid()
  );
$$;

-- Helper: is the current user an admin of a given board?
create or replace function public.is_board_admin(target_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from board_members
    where board_id = target_board_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: is the current user an admin or member (i.e. NOT a
-- read-only viewer) of a given board?
create or replace function public.is_board_editor(target_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from board_members
    where board_id = target_board_id
      and user_id = auth.uid()
      and role in ('admin', 'member')
  );
$$;

-- boards: members can read; any authenticated user can create;
-- only admins can update/delete.
drop policy if exists "boards_select" on boards;
create policy "boards_select" on boards for select
  using (public.is_board_member(id));

drop policy if exists "boards_insert" on boards;
create policy "boards_insert" on boards for insert
  with check (auth.uid() = created_by);

drop policy if exists "boards_update" on boards;
create policy "boards_update" on boards for update
  using (public.is_board_admin(id));

drop policy if exists "boards_delete" on boards;
create policy "boards_delete" on boards for delete
  using (public.is_board_admin(id));

-- board_members: members can see who else is on the board;
-- only admins can invite/remove members.
drop policy if exists "board_members_select" on board_members;
create policy "board_members_select" on board_members for select
  using (public.is_board_member(board_id));

drop policy if exists "board_members_insert" on board_members;
create policy "board_members_insert" on board_members for insert
  with check (public.is_board_admin(board_id));

drop policy if exists "board_members_delete" on board_members;
create policy "board_members_delete" on board_members for delete
  using (public.is_board_admin(board_id));

-- board_columns: any member can read/write; viewers are restricted
-- to read-only at the application layer (see README for notes).
drop policy if exists "columns_select" on board_columns;
create policy "columns_select" on board_columns for select
  using (public.is_board_member(board_id));

drop policy if exists "columns_insert" on board_columns;
create policy "columns_insert" on board_columns for insert
  with check (public.is_board_editor(board_id));

drop policy if exists "columns_update" on board_columns;
create policy "columns_update" on board_columns for update
  using (public.is_board_editor(board_id));

drop policy if exists "columns_delete" on board_columns;
create policy "columns_delete" on board_columns for delete
  using (public.is_board_admin(board_id));

-- cards: any member can read/write.
drop policy if exists "cards_select" on cards;
create policy "cards_select" on cards for select
  using (public.is_board_member(board_id));

drop policy if exists "cards_insert" on cards;
create policy "cards_insert" on cards for insert
  with check (public.is_board_editor(board_id));

drop policy if exists "cards_update" on cards;
create policy "cards_update" on cards for update
  using (public.is_board_editor(board_id));

drop policy if exists "cards_delete" on cards;
create policy "cards_delete" on cards for delete
  using (public.is_board_member(board_id));

-- ============================================================
-- Realtime: broadcast changes on these tables to subscribers
-- ============================================================

alter publication supabase_realtime add table board_columns;
alter publication supabase_realtime add table cards;
