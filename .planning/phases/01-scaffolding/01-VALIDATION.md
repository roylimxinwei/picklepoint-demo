---
phase: 1
slug: scaffolding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x (backend) / none (frontend — no test runner in Phase 1 scope) |
| **Config file** | `backend/pytest.ini` — Wave 0 installs |
| **Quick run command** | `cd backend && pytest tests/ -x -q` |
| **Full suite command** | `cd backend && pytest tests/ -v` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && pytest tests/ -x -q`
- **After every plan wave:** Run `cd backend && pytest tests/ -v`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | SC-2 | unit | `pytest tests/test_health.py -x` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 0 | SC-4 | unit | `pytest tests/test_config.py -x` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | SC-1 | smoke | `curl http://localhost:3000` | N/A — manual | ⬜ pending |
| 01-01-04 | 01 | 1 | SC-2 | unit | `pytest tests/test_health.py -x` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | SC-4 | unit | `pytest tests/test_config.py -x` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 2 | SC-3 | integration | Browser console check | N/A — manual | ⬜ pending |
| 01-01-07 | 01 | 2 | SC-5 | smoke | `uvicorn main:app` | N/A — manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/__init__.py` — empty file to make tests a package
- [ ] `backend/tests/test_health.py` — covers SC-2 (`GET /health` returns 200)
- [ ] `backend/tests/test_config.py` — covers SC-4 (settings loads SUPABASE_URL from env)
- [ ] `backend/pytest.ini` — configure testpaths and asyncio mode
- [ ] Framework install: `pip install pytest pytest-asyncio httpx` (add to requirements.txt)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Next.js loads at public URL | SC-1 | Requires deployed Vercel URL | Open Vercel URL in browser, confirm page renders |
| CORS cross-origin fetch | SC-3 | Requires browser + two running servers | Open localhost:3000, fetch from localhost:8000 via browser devtools, confirm no CORS errors |
| Local dev connects to Supabase | SC-5 | Requires Supabase project with real credentials | Run `npm run dev` and `uvicorn main:app`, confirm no startup errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
