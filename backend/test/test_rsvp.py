from app.rsvp import GoogleSheetsRsvpStore, create_rsvp_store, get_session_secret


def test_key_vault_files_configure_rsvp(monkeypatch, tmp_path):
    monkeypatch.delenv("GOOGLE_SHEETS_WEB_APP_URL", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_SHARED_SECRET", raising=False)
    monkeypatch.delenv("RSVP_SESSION_SECRET", raising=False)
    monkeypatch.setenv("SECRETS_DIR", str(tmp_path))

    (tmp_path / "google-sheets-web-app-url").write_text("https://script.google.com/example/exec")
    (tmp_path / "google-sheets-shared-secret").write_text("shared-secret")
    (tmp_path / "rsvp-session-secret").write_text("session-secret")

    assert isinstance(create_rsvp_store(), GoogleSheetsRsvpStore)
    assert get_session_secret() == b"session-secret"
