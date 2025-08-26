from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .database import Base


class Printer(Base):
	__tablename__ = "printers"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
	ip_address: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
	snmp_community: Mapped[str] = mapped_column(String(255), nullable=False, default="public")
	snmp_port: Mapped[int] = mapped_column(Integer, nullable=False, default=161)
	snmp_version: Mapped[str] = mapped_column(String(10), nullable=False, default="2c")
	location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

	# Live data
	online: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
	last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
	sys_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
	printer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
	hr_device_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
	status_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

	supplies: Mapped[list[PrinterSupply]] = relationship("PrinterSupply", back_populates="printer", cascade="all, delete-orphan")


class PrinterSupply(Base):
	__tablename__ = "printer_supplies"
	__table_args__ = (
		UniqueConstraint("printer_id", "supply_index", name="uq_printer_supply_index"),
	)

	id: Mapped[int] = mapped_column(Integer, primary_key=True)
	printer_id: Mapped[int] = mapped_column(ForeignKey("printers.id", ondelete="CASCADE"), index=True, nullable=False)
	supply_index: Mapped[int] = mapped_column(Integer, nullable=False)
	description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
	level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
	max_capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
	percent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
	updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

	printer: Mapped[Printer] = relationship("Printer", back_populates="supplies")