---
phase: 2
slug: database-schema
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x (already installed) |
| **Config file** | `backend/pytest.ini` (exists — `testpaths = tests`, `asyncio_mode = auto`) |
| **Quick run command** | `cd backend && python -m pytest tests/test_schema.py -x -q` |
| **Full suite command** | `cd backend && python -m pytest -x -q` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/test_schema.py -x -q`
- **After every plan wave:** Run `cd backend && python -m pytest -x -q`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | SC-1 (tables exist) | smoke | `supabase db push --dry-run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | SC-3 (migrations reproducible) | smoke | `supabase db reset` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | SC-2 (RLS enabled) | integration | `pytest tests/test_schema.py::test_rls_enabled -x` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 0 | SC-4 (service role insert) | integration | `pytest tests/test_schema.py::test_service_role_insert -x` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 0 | SC-4 (anon insert rejected) | integration | `pytest tests/test_schema.py::test_anon_insert_rejected -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_schema.py` — stubs for SC-1 through SC-4 (all success criteria)
- [ ] `backend/.env` — must include `SUPABASE_ANON_KEY` for RLS rejection tests
- [ ] `supabase/` directory — created by `supabase init` in Wave 0

*Wave 0 creates the test infrastructure and Supabase CLI setup before migration work begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migration reproducible from scratch | SC-3 | Requires fresh Supabase instance or `db reset` with network access | Run `supabase db reset` and verify all tables created |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
