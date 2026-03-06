"""
Schema integration tests for PicklePoint Supabase database.
These tests require a linked Supabase project (supabase db push must have been run).
Run: cd backend && python -m pytest tests/test_schema.py -x -q
"""
import os
import pytest

# Tests skip by default unless SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
# After running `supabase db push`, set env vars and re-run to validate live schema.

pytestmark = pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    reason="Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (live Supabase instance)"
)


def test_tables_exist():
    """SC-1: All 13 core tables exist in the public schema."""
    # Placeholder — implementation uses supabase-py service role client to query
    # information_schema.tables and assert all 13 table names are present.
    pytest.skip("Implement after supabase db push: query information_schema.tables")


def test_rls_enabled():
    """SC-2: Row Level Security is enabled on every table."""
    # Placeholder — query pg_tables or pg_class to confirm rowsecurity = true
    # for all 13 tables.
    pytest.skip("Implement after supabase db push: query pg_tables.rowsecurity")


def test_service_role_insert():
    """SC-4: Service role can INSERT into events table."""
    # Placeholder — use service role key to insert a test event row,
    # assert HTTP 201, then clean up (delete the inserted row).
    pytest.skip("Implement after supabase db push: service role insert test")


def test_anon_insert_rejected():
    """SC-4: Anon role cannot INSERT into any table (RLS rejects)."""
    # Placeholder — use anon key to attempt INSERT into events,
    # assert HTTP 403 or RLS violation error.
    pytest.skip("Implement after supabase db push: anon insert rejection test")
