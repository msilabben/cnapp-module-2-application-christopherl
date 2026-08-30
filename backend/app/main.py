import os
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from uuid import uuid4

from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from app.rsvp import RsvpSubmission, create_rsvp_store, get_session_secret, sign_session, verify_session

RSVP_COOKIE = "wedding_rsvp_session"

def read_secret(name: str) -> str:
    secrets_dir = Path(os.environ.get("SECRETS_DIR", "/mnt/secrets-store"))
    secret_path = secrets_dir / name

    if not secret_path.exists():
        raise RuntimeError(f"Missing required secret file: {secret_path}")

    return secret_path.read_text().strip()


def get_version() -> str:
    try:
        return version("backend")
    except PackageNotFoundError:
        return "0.0.0-dev"

def create_app():
    app = FastAPI(title="Christopher og Rikke – bryllups-API", version=get_version())
    rsvp_store = create_rsvp_store()
    session_secret = get_session_secret()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    @app.get("/api/secret")
    def secret_check():
        return {"secret": read_secret("backend-secret")}

    @app.get("/api/version")
    def api_version():
        return {"version": get_version()}


    @app.get("/api/message")
    def get_message():
        return {
            "message": "Hello from FastAPI Backend!",
            "deployment": "This is a container-friendly backend."
        }

    @app.get("/api/rsvp", response_model=RsvpSubmission)
    def get_rsvp(wedding_rsvp_session: str | None = Cookie(default=None)):
        session_id = verify_session(wedding_rsvp_session, session_secret)
        if not session_id:
            raise HTTPException(status_code=404, detail="No RSVP response was found")
        submission = rsvp_store.get(session_id)
        if not submission:
            raise HTTPException(status_code=404, detail="No RSVP response was found")
        return submission

    @app.post("/api/rsvp", response_model=RsvpSubmission)
    def save_rsvp(
        submission: RsvpSubmission,
        response: Response,
        wedding_rsvp_session: str | None = Cookie(default=None),
    ):
        session_id = verify_session(wedding_rsvp_session, session_secret) or uuid4().hex
        rsvp_store.save(session_id, submission)
        response.set_cookie(
            key=RSVP_COOKIE,
            value=sign_session(session_id, session_secret),
            max_age=60 * 60 * 24 * 540,
            httponly=True,
            secure=os.environ.get("APP_ENV", "development") != "development",
            samesite="lax",
            path="/",
        )
        return submission

    return app
