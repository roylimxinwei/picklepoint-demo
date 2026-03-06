-- ==========================================
-- Migration 3: RLS policies and Realtime publication
-- ==========================================

-- ---- Security definer helper ----
-- Checks if the current user has a given role for a given event.
-- SECURITY DEFINER + STABLE allows Postgres to cache the result per statement
-- (100x+ performance improvement vs. inline correlated subqueries per row).
create or replace function public.has_event_role(p_event_id uuid, p_role text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.event_roles
    where user_id = (select auth.uid())
      and event_id = p_event_id
      and role = p_role
  );
$$;

-- ---- Enable RLS on all 13 tables ----
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.courts enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_roles enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.pool_groups enable row level security;
alter table public.pool_standings enable row level security;
alter table public.brackets enable row level security;
alter table public.bracket_slots enable row level security;

-- ---- events policies ----
create policy "anon read events"
  on public.events for select
  to anon
  using (true);

create policy "authenticated read events"
  on public.events for select
  to authenticated
  using (true);

create policy "authenticated create event"
  on public.events for insert
  to authenticated
  with check (true);  -- organizer role auto-inserted after event creation

create policy "organizer update event"
  on public.events for update
  to authenticated
  using (public.has_event_role(id, 'organizer'))
  with check (public.has_event_role(id, 'organizer'));

-- ---- categories policies ----
create policy "anon read categories"
  on public.categories for select
  to anon
  using (true);

create policy "authenticated read categories"
  on public.categories for select
  to authenticated
  using (true);

create policy "organizer manage categories"
  on public.categories for insert
  to authenticated
  with check (public.has_event_role(event_id, 'organizer'));

-- ---- courts policies ----
create policy "anon read courts"
  on public.courts for select
  to anon
  using (true);

create policy "authenticated read courts"
  on public.courts for select
  to authenticated
  using (true);

create policy "organizer insert courts"
  on public.courts for insert
  to authenticated
  with check (public.has_event_role(event_id, 'organizer'));

create policy "organizer update courts"
  on public.courts for update
  to authenticated
  using (public.has_event_role(event_id, 'organizer'))
  with check (public.has_event_role(event_id, 'organizer'));

create policy "organizer delete courts"
  on public.courts for delete
  to authenticated
  using (public.has_event_role(event_id, 'organizer'));

-- ---- teams policies ----
create policy "anon read teams"
  on public.teams for select
  to anon
  using (true);

create policy "authenticated read teams"
  on public.teams for select
  to authenticated
  using (true);

-- ---- team_members policies ----
create policy "anon read team_members"
  on public.team_members for select
  to anon
  using (true);

create policy "authenticated read team_members"
  on public.team_members for select
  to authenticated
  using (true);

-- ---- event_registrations policies ----
create policy "player read own registrations"
  on public.event_registrations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "organizer read all registrations"
  on public.event_registrations for select
  to authenticated
  using (public.has_event_role(event_id, 'organizer'));

create policy "player insert own registration"
  on public.event_registrations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "player update own registration"
  on public.event_registrations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---- event_roles policies ----
create policy "read own event_roles"
  on public.event_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "organizer read all event_roles"
  on public.event_roles for select
  to authenticated
  using (public.has_event_role(event_id, 'organizer'));

create policy "system insert event_roles"
  on public.event_roles for insert
  to authenticated
  with check (true);  -- FastAPI service role handles role assignment; authenticated for organizer self-grant

-- ---- matches policies ----
create policy "anon read matches"
  on public.matches for select
  to anon
  using (true);

create policy "authenticated read matches"
  on public.matches for select
  to authenticated
  using (true);

create policy "organizer manage matches"
  on public.matches for insert
  to authenticated
  with check (public.has_event_role(event_id, 'organizer'));

create policy "organizer update matches"
  on public.matches for update
  to authenticated
  using (public.has_event_role(event_id, 'organizer'));

-- ---- match_events policies ----
create policy "read match_events"
  on public.match_events for select
  to anon, authenticated
  using (true);

create policy "referee insert match_events"
  on public.match_events for insert
  to authenticated
  with check (
    public.has_event_role(
      (select event_id from public.matches where id = match_id),
      'referee'
    )
  );

-- ---- pool_groups policies ----
create policy "anon read pool_groups"
  on public.pool_groups for select
  to anon
  using (true);

create policy "authenticated read pool_groups"
  on public.pool_groups for select
  to authenticated
  using (true);

-- ---- pool_standings policies ----
create policy "anon read pool_standings"
  on public.pool_standings for select
  to anon
  using (true);

create policy "authenticated read pool_standings"
  on public.pool_standings for select
  to authenticated
  using (true);

-- ---- brackets policies ----
create policy "anon read brackets"
  on public.brackets for select
  to anon
  using (true);

create policy "authenticated read brackets"
  on public.brackets for select
  to authenticated
  using (true);

-- ---- bracket_slots policies ----
create policy "anon read bracket_slots"
  on public.bracket_slots for select
  to anon
  using (true);

create policy "authenticated read bracket_slots"
  on public.bracket_slots for select
  to authenticated
  using (true);

-- ---- Realtime replication ----
-- matches table must be in the publication for live score broadcasts.
-- Without this, Supabase Realtime will not fire even if clients subscribe successfully.
alter publication supabase_realtime add table public.matches;
