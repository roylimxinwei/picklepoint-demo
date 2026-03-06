"""
Schema integration tests for PicklePoint Supabase database.
These tests require a linked Supabase project (supabase db push must have been run).
Run: cd backend && python -m pytest tests/test_schema.py -x -q

Env vars required (set in backend/.env):
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_ANON_KEY
"""
import os
import uuid

import httpx
import pytest
from dotenv import load_dotenv
from supabase import create_client

# Load .env from backend/ directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Skip all tests if credentials are absent
pytestmark = pytest.mark.skipif(
    not SUPABASE_URL or not SERVICE_ROLE_KEY or not ANON_KEY,
    reason="Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY env vars",
)

EXPECTED_TABLES = [
    "events",
    "categories",
    "courts",
    "teams",
    "team_members",
    "event_registrations",
    "event_roles",
    "matches",
    "match_events",
    "pool_groups",
    "pool_standings",
    "brackets",
    "bracket_slots",
]


def service_client():
    """Supabase client authenticated as service role (bypasses RLS)."""
    return create_client(SUPABASE_URL, SERVICE_ROLE_KEY)


def anon_client():
    """Supabase client authenticated as anon role."""
    return create_client(SUPABASE_URL, ANON_KEY)


# ---------------------------------------------------------------------------
# SC-1: All 13 core tables exist
# ---------------------------------------------------------------------------


def test_tables_exist():
    """SC-1: All 13 core tables exist in the public schema."""
    client = service_client()
    missing = []
    for table in EXPECTED_TABLES:
        try:
            # limit(0) returns immediately — we only care that the table exists,
            # not its contents.  A missing table raises an APIError.
            client.table(table).select("*", count="exact").limit(0).execute()
        except Exception as exc:
            missing.append(f"{table}: {exc}")

    assert not missing, f"Missing or inaccessible tables:\n" + "\n".join(missing)


# ---------------------------------------------------------------------------
# SC-2: Row Level Security is enabled on all tables
# ---------------------------------------------------------------------------


def _anon_insert_http(table: str, payload: dict) -> httpx.Response:
    """Fire a raw PostgREST INSERT as the anon role and return the response."""
    return httpx.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        json=payload,
        timeout=10,
    )


def test_rls_enabled():
    """SC-2: RLS is enforced — anon role cannot INSERT into any table.

    We attempt INSERT on three representative tables that cover all RLS
    categories (events = organizer-only write, match_events = referee-only
    write, teams = organizer-only write).  A 403 on every attempt confirms
    that RLS is active and the default-deny posture is correct.

    If RLS were disabled on any table, Postgres would allow the anon INSERT
    (or fail only on a FK constraint, returning 4xx with a different code).
    We check specifically for a permissions/policy error (HTTP 401 or 403,
    or a Postgres error code 42501 — insufficient_privilege).
    """
    tables_to_probe = {
        "events": {
            "event_code": "XTEST",
            "name": "RLS probe",
            "status": "draft",
            "created_by": str(uuid.uuid4()),
        },
        "match_events": {
            "match_id": str(uuid.uuid4()),
            "event_type": "point_scored",
            "scoring_team": 1,
            "idempotency_key": str(uuid.uuid4()),
            "team1_score": 1,
            "team2_score": 0,
            "game_number": 1,
        },
        # teams has category_id + name only (no event_id column on this table)
        "teams": {
            "category_id": str(uuid.uuid4()),
            "name": "RLS probe team",
        },
    }

    rls_failures = []
    for table, payload in tables_to_probe.items():
        r = _anon_insert_http(table, payload)
        # Accept 401, 403 (RLS / JWT rejection), or a Postgres 42501 error
        # surfaced as a 4xx response body.
        is_rejected = r.status_code in (401, 403)
        if not is_rejected:
            # Some PostgREST versions return 422 or 400 for policy violations
            body = r.text
            is_rejected = "42501" in body or "insufficient_privilege" in body or "new row violates row-level security" in body
        if not is_rejected:
            rls_failures.append(
                f"{table}: expected 401/403 but got HTTP {r.status_code} — {r.text[:200]}"
            )

    assert not rls_failures, "RLS not enforced on:\n" + "\n".join(rls_failures)


# ---------------------------------------------------------------------------
# SC-4a: Service role can INSERT into events
# ---------------------------------------------------------------------------


def _create_test_auth_user() -> str:
    """Create a temporary auth user via Supabase Admin API; return its UUID."""
    r = httpx.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers={
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "email": f"schema-test-{uuid.uuid4()}@picklepoint.test",
            "password": "test-password-not-used",
            "email_confirm": True,
        },
        timeout=10,
    )
    assert r.status_code in (200, 201), f"Failed to create test auth user: {r.text}"
    return r.json()["id"]


def _delete_test_auth_user(user_id: str) -> None:
    """Delete the temporary auth user created for this test."""
    httpx.delete(
        f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
        headers={
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        },
        timeout=10,
    )


def test_service_role_insert():
    """SC-4: Service role can INSERT into events table."""
    client = service_client()
    test_event_code = "SCHMA"  # 5-char code, unique enough for a test row

    # Create a real auth.users row so the FK constraint on events.created_by is satisfied
    test_user_id = _create_test_auth_user()
    try:
        # Clean up any leftover row from a prior failed run
        client.table("events").delete().eq("event_code", test_event_code).execute()

        # INSERT via service role — should succeed (no RLS restriction for service role)
        result = client.table("events").insert(
            {
                "event_code": test_event_code,
                "name": "Schema Test Event",
                "status": "draft",
                "created_by": test_user_id,
            }
        ).execute()

        assert result.data, f"INSERT returned no data: {result}"
        inserted_id = result.data[0]["id"]

        # Clean up event row
        client.table("events").delete().eq("id", inserted_id).execute()
    finally:
        # Always clean up the test auth user
        _delete_test_auth_user(test_user_id)


# ---------------------------------------------------------------------------
# SC-4b: Anon role cannot INSERT into events (RLS rejection)
# ---------------------------------------------------------------------------


def test_anon_insert_rejected():
    """SC-4: Anon role cannot INSERT into events — RLS rejects with 403."""
    r = _anon_insert_http(
        "events",
        {
            "event_code": "ANONT",
            "name": "Anon probe",
            "status": "draft",
            "created_by": str(uuid.uuid4()),
        },
    )

    is_rejected = r.status_code in (401, 403)
    if not is_rejected:
        body = r.text
        is_rejected = (
            "42501" in body
            or "insufficient_privilege" in body
            or "new row violates row-level security" in body
        )

    assert is_rejected, (
        f"Expected anon INSERT to be rejected (401/403) but got "
        f"HTTP {r.status_code} — {r.text[:300]}"
    )
