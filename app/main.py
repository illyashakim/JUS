from __future__ import annotations

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base, SessionLocal
from .poller import Poller
from .routers.printers import router as printers_router


app = FastAPI(title=settings.app_title)
app.mount("/static", StaticFiles(directory="/workspace/static"), name="static")

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(printers_router)

# Poller
poller = Poller(session_factory=SessionLocal)


@app.on_event("startup")
def on_startup():
	poller.start()


@app.on_event("shutdown")
def on_shutdown():
	poller.stop()