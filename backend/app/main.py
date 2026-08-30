from importlib.metadata import version, PackageNotFoundError

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


import os
from pathlib import Path

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
    app = FastAPI(title="Simple FastAPI API", version=get_version())

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

    return app