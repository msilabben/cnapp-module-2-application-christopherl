import hashlib
import hmac
import json
import os
from abc import ABC, abstractmethod
from pathlib import Path
from threading import Lock
from typing import Literal
from urllib.request import Request, urlopen

from pydantic import BaseModel, Field


class RsvpSubmission(BaseModel):
    familyName: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    attending: Literal["yes", "no"]
    guestCount: int = Field(ge=1, le=20)
    guestNames: str = Field(default="", max_length=1000)
    dietaryNeeds: str = Field(default="", max_length=2000)
    message: str = Field(default="", max_length=2000)


class RsvpStore(ABC):
    @abstractmethod
    def get(self, session_id: str) -> RsvpSubmission | None:
        raise NotImplementedError

    @abstractmethod
    def save(self, session_id: str, submission: RsvpSubmission) -> None:
        raise NotImplementedError


class MemoryRsvpStore(RsvpStore):
    """Development store. Data is removed when the server restarts."""

    def __init__(self) -> None:
        self._records: dict[str, RsvpSubmission] = {}
        self._lock = Lock()

    def get(self, session_id: str) -> RsvpSubmission | None:
        with self._lock:
            return self._records.get(session_id)

    def save(self, session_id: str, submission: RsvpSubmission) -> None:
        with self._lock:
            self._records[session_id] = submission


class GoogleSheetsRsvpStore(RsvpStore):
    """Calls the Google Apps Script endpoint in integrations/google-apps-script."""

    def __init__(self, endpoint: str, shared_secret: str) -> None:
        self._endpoint = endpoint
        self._shared_secret = shared_secret

    def _post(self, payload: dict) -> dict:
        body = json.dumps({"token": self._shared_secret, **payload}).encode()
        request = Request(self._endpoint, data=body, headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read())

    def get(self, session_id: str) -> RsvpSubmission | None:
        result = self._post({"action": "get", "sessionId": session_id})
        if not result.get("found"):
            return None
        return RsvpSubmission.model_validate(result["data"])

    def save(self, session_id: str, submission: RsvpSubmission) -> None:
        result = self._post({
            "action": "upsert",
            "sessionId": session_id,
            "data": submission.model_dump(),
        })
        if not result.get("ok"):
            raise RuntimeError("Google Sheets did not accept the RSVP response")


def get_config_value(environment_name: str, secret_filename: str) -> str:
    configured_value = os.environ.get(environment_name, "").strip()
    if configured_value:
        return configured_value

    secrets_dir = Path(os.environ.get("SECRETS_DIR", "/mnt/secrets-store"))
    secret_file = secrets_dir / secret_filename
    if secret_file.exists():
        return secret_file.read_text().strip()

    return ""


def create_rsvp_store() -> RsvpStore:
    endpoint = get_config_value("GOOGLE_SHEETS_WEB_APP_URL", "google-sheets-web-app-url")
    shared_secret = get_config_value("GOOGLE_SHEETS_SHARED_SECRET", "google-sheets-shared-secret")
    if endpoint and shared_secret:
        return GoogleSheetsRsvpStore(endpoint, shared_secret)
    return MemoryRsvpStore()


def get_session_secret() -> bytes:
    configured_secret = get_config_value("RSVP_SESSION_SECRET", "rsvp-session-secret")
    if configured_secret:
        return configured_secret.encode()

    secrets_dir = Path(os.environ.get("SECRETS_DIR", "/mnt/secrets-store"))
    existing_secret = secrets_dir / "backend-secret"
    if existing_secret.exists():
        return hashlib.sha256(existing_secret.read_bytes()).digest()

    return b"local-development-session-secret"


def sign_session(session_id: str, secret: bytes) -> str:
    signature = hmac.new(secret, session_id.encode(), hashlib.sha256).hexdigest()
    return f"{session_id}.{signature}"


def verify_session(token: str | None, secret: bytes) -> str | None:
    if not token or "." not in token:
        return None
    session_id, signature = token.rsplit(".", 1)
    expected = hmac.new(secret, session_id.encode(), hashlib.sha256).hexdigest()
    if not session_id or not hmac.compare_digest(signature, expected):
        return None
    return session_id
