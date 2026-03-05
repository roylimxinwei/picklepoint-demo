import os
import pytest
import httpx
from httpx import ASGITransport


@pytest.fixture(autouse=True)
def set_env_vars(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-key")


@pytest.fixture
def app(set_env_vars):
    # Import after env vars are set so Settings can be loaded
    from config import get_settings
    get_settings.cache_clear()
    from main import app
    return app


@pytest.mark.asyncio
async def test_health_returns_200(app):
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
