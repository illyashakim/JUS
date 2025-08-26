from __future__ import annotations

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from .config import settings


class Base(DeclarativeBase):
	pass


engine: Engine = create_engine(
	settings.database_url,
	connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
	pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
	if settings.database_url.startswith("sqlite"):
		cursor = dbapi_connection.cursor()
		cursor.execute("PRAGMA foreign_keys=ON")
		cursor.close()


def get_session():
	session = SessionLocal()
	try:
		yield session
	finally:
		session.close()