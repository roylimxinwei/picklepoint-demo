import pytest
from pydantic import ValidationError


@pytest.fixture(autouse=True)
def clear_settings_cache():
    from config import get_settings
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_settings_loads_from_env(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "my-service-key")
    from config import Settings
    settings = Settings()
    assert settings.supabase_url == "https://example.supabase.co"


def test_settings_origins_list_splits_comma(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "my-service-key")
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://a.com,http://b.com")
    from config import Settings
    settings = Settings()
    assert settings.origins_list == ["http://a.com", "http://b.com"]
    assert len(settings.origins_list) == 2


def test_settings_missing_required_raises(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    from config import Settings
    with pytest.raises(ValidationError):
        Settings(_env_file=None)
