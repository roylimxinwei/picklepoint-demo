-- Seed data for PicklePoint development. Run via: supabase db reset
-- Uses fixed UUIDs for fake users (dev only — not real Supabase Auth accounts).
-- Wrap in transaction so all-or-nothing on failure.

begin;

-- ==========================================
-- 1. Fake auth users (dev seeds only)
-- ==========================================
-- Insert fake user records into auth.users for FK references.
-- ON CONFLICT DO NOTHING makes this re-runnable.
insert into auth.users (id, email, created_at, updated_at, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000000001', 'organizer@picklepoint.dev', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'referee@picklepoint.dev', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'player1@picklepoint.dev', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'player2@picklepoint.dev', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'player3@picklepoint.dev', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'player4@picklepoint.dev', now(), now(), now())
on conflict (id) do nothing;

-- ==========================================
-- 2. Events
-- ==========================================
insert into public.events (id, name, venue, event_date, event_code, status, created_by)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Picklepoint Spring Open 2026',
    'Riverside Sports Complex',
    '2026-04-15',
    '12345',
    'live',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Summer Slam 2026',
    'Lakeside Recreation Center',
    '2026-07-20',
    '67890',
    'draft',
    '00000000-0000-0000-0000-000000000001'
  )
on conflict (id) do nothing;

-- ==========================================
-- 3. Categories
-- ==========================================
insert into public.categories (id, event_id, name, format)
values
  -- Spring Open categories
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Open Singles', 'singles'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Open Doubles', 'doubles'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Mixed Doubles', 'mixed'),
  -- Summer Slam categories
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Open Doubles', 'doubles'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Mixed Doubles', 'mixed')
on conflict (id) do nothing;

-- ==========================================
-- 4. Courts (for the live event)
-- ==========================================
insert into public.courts (id, event_id, name, status)
values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 1', 'active'),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 2', 'active'),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 3', 'active'),
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 4', 'active')
on conflict (id) do nothing;

-- ==========================================
-- 5. Teams
-- ==========================================
insert into public.teams (id, category_id, name)
values
  -- Open Singles teams (1 player each)
  ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'Alex Chen'),
  ('dddddddd-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'Jordan Rivera'),
  ('dddddddd-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', 'Sam Torres'),
  ('dddddddd-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000001', 'Morgan Lee'),
  -- Open Doubles teams (2 players each)
  ('dddddddd-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000002', 'Thunder Pickles'),
  ('dddddddd-0000-0000-0000-000000000006', 'bbbbbbbb-0000-0000-0000-000000000002', 'Dink Dynasty'),
  ('dddddddd-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000002', 'Net Force'),
  ('dddddddd-0000-0000-0000-000000000008', 'bbbbbbbb-0000-0000-0000-000000000002', 'Smash Bros'),
  -- Mixed Doubles teams
  ('dddddddd-0000-0000-0000-000000000009', 'bbbbbbbb-0000-0000-0000-000000000003', 'Pickle Power'),
  ('dddddddd-0000-0000-0000-000000000010', 'bbbbbbbb-0000-0000-0000-000000000003', 'Court Jesters')
on conflict (id) do nothing;

-- ==========================================
-- 6. Team members
-- ==========================================
insert into public.team_members (team_id, user_id)
values
  -- Singles: one player each
  ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004'),
  ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'),
  ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006'),
  -- Doubles: two players per team
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'),
  ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005'),
  ('dddddddd-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006'),
  -- Mixed doubles
  ('dddddddd-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003'),
  ('dddddddd-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000005'),
  ('dddddddd-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004'),
  ('dddddddd-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006')
on conflict do nothing;

-- ==========================================
-- 7. Event roles
-- ==========================================
insert into public.event_roles (id, event_id, user_id, role)
values
  -- Spring Open roles
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'organizer'),
  ('eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'referee'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'player'),
  ('eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'player'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'player'),
  ('eeeeeeee-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'player'),
  -- Summer Slam roles
  ('eeeeeeee-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'organizer')
on conflict (id) do nothing;

-- ==========================================
-- 8. Event registrations
-- ==========================================
insert into public.event_registrations (id, event_id, category_id, user_id, team_id, checked_in)
values
  -- Singles registrations
  ('ffffffff-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000001', true),
  ('ffffffff-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000002', true),
  ('ffffffff-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0000-000000000003', false),
  ('ffffffff-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'dddddddd-0000-0000-0000-000000000004', false),
  -- Doubles registrations
  ('ffffffff-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000005', true),
  ('ffffffff-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000005', true),
  ('ffffffff-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0000-000000000006', true),
  ('ffffffff-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'dddddddd-0000-0000-0000-000000000006', true)
on conflict (id) do nothing;

-- ==========================================
-- 9. Pool groups (for doubles category)
-- ==========================================
insert into public.pool_groups (id, event_id, category_id, name)
values
  ('gggggggg-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'Group A'),
  ('gggggggg-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'Group B')
on conflict (id) do nothing;

-- ==========================================
-- 10. Pool standings (initial — 0 wins/losses)
-- ==========================================
insert into public.pool_standings (id, pool_group_id, team_id, wins, losses, points_for, points_against)
values
  ('hhhhhhhh-0000-0000-0000-000000000001', 'gggggggg-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000005', 1, 0, 11, 5),
  ('hhhhhhhh-0000-0000-0000-000000000002', 'gggggggg-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000006', 0, 1, 5, 11),
  ('hhhhhhhh-0000-0000-0000-000000000003', 'gggggggg-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000007', 0, 0, 0, 0),
  ('hhhhhhhh-0000-0000-0000-000000000004', 'gggggggg-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000008', 0, 0, 0, 0)
on conflict (id) do nothing;

-- ==========================================
-- 11. Bracket (for singles elimination)
-- ==========================================
insert into public.brackets (id, event_id, category_id)
values
  ('iiiiiiii-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ==========================================
-- 12. Bracket slots (4 players = 2 semis + 1 final)
-- ==========================================
insert into public.bracket_slots (id, bracket_id, round, slot_number, team_id)
values
  -- Semis (round 2)
  ('jjjjjjjj-0000-0000-0000-000000000001', 'iiiiiiii-0000-0000-0000-000000000001', 2, 1, 'dddddddd-0000-0000-0000-000000000001'),
  ('jjjjjjjj-0000-0000-0000-000000000002', 'iiiiiiii-0000-0000-0000-000000000001', 2, 2, 'dddddddd-0000-0000-0000-000000000002'),
  ('jjjjjjjj-0000-0000-0000-000000000003', 'iiiiiiii-0000-0000-0000-000000000001', 2, 3, 'dddddddd-0000-0000-0000-000000000003'),
  ('jjjjjjjj-0000-0000-0000-000000000004', 'iiiiiiii-0000-0000-0000-000000000001', 2, 4, 'dddddddd-0000-0000-0000-000000000004'),
  -- Final (round 1)
  ('jjjjjjjj-0000-0000-0000-000000000005', 'iiiiiiii-0000-0000-0000-000000000001', 1, 1, null),
  ('jjjjjjjj-0000-0000-0000-000000000006', 'iiiiiiii-0000-0000-0000-000000000001', 1, 2, null)
on conflict (id) do nothing;

-- ==========================================
-- 13. Matches
-- ==========================================
insert into public.matches (id, event_id, category_id, court_id, team1_id, team2_id, referee_id, status, current_score_team1, current_score_team2, current_game, pool_group_id, scheduled_at, started_at)
values
  -- In-progress match (doubles, pool group A, court 1)
  (
    'kkkkkkkk-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000001',
    'dddddddd-0000-0000-0000-000000000005',
    'dddddddd-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    'in_progress',
    7,
    4,
    1,
    'gggggggg-0000-0000-0000-000000000001',
    now() - interval '30 minutes',
    now() - interval '25 minutes'
  ),
  -- Scheduled match (singles, semi-final bracket, court 2)
  (
    'kkkkkkkk-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000002',
    'dddddddd-0000-0000-0000-000000000001',
    'dddddddd-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'scheduled',
    0,
    0,
    1,
    null,
    now() + interval '15 minutes',
    null
  ),
  -- Scheduled match (singles, semi-final bracket, court 3)
  (
    'kkkkkkkk-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'scheduled',
    0,
    0,
    1,
    null,
    now() + interval '15 minutes',
    null
  )
on conflict (id) do nothing;

-- Link bracket slots to scheduled matches
update public.bracket_slots
  set match_id = 'kkkkkkkk-0000-0000-0000-000000000002'
  where id = 'jjjjjjjj-0000-0000-0000-000000000001';

update public.bracket_slots
  set match_id = 'kkkkkkkk-0000-0000-0000-000000000003'
  where id = 'jjjjjjjj-0000-0000-0000-000000000003';

-- Update matches with bracket slot references
update public.matches
  set bracket_slot_id = 'jjjjjjjj-0000-0000-0000-000000000001'
  where id = 'kkkkkkkk-0000-0000-0000-000000000002';

update public.matches
  set bracket_slot_id = 'jjjjjjjj-0000-0000-0000-000000000003'
  where id = 'kkkkkkkk-0000-0000-0000-000000000003';

-- ==========================================
-- 14. Match events for the in-progress match
-- (Tests the append-only log and trigger)
-- ==========================================
insert into public.match_events (id, idempotency_key, match_id, event_type, scoring_team, team1_score, team2_score, game_number, created_by)
values
  -- Team 1 scores first
  ('llllllll-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 1, 0, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 2, 1, 1, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 2, 1, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 3, 1, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 2, 3, 2, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 4, 2, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 5, 2, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 2, 5, 3, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000009', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 6, 3, 1, '00000000-0000-0000-0000-000000000002'),
  -- Point undone (undo last point for team 1)
  ('llllllll-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000010', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_undone', null, 5, 3, 1, '00000000-0000-0000-0000-000000000002'),
  -- Continue scoring
  ('llllllll-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 6, 3, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000012', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 2, 6, 4, 1, '00000000-0000-0000-0000-000000000002'),
  ('llllllll-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000013', 'kkkkkkkk-0000-0000-0000-000000000001', 'point_scored', 1, 7, 4, 1, '00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- Note: The sync_match_scores trigger will fire on each match_events insert above,
-- updating matches.current_score_team1/2/game accordingly.
-- After all inserts, kkkkkkkk-0000-0000-0000-000000000001 should show 7-4 game 1.

commit;
