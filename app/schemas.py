from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


class PrinterBase(BaseModel):
	name: Optional[str] = Field(default=None)
	ip_address: str
	snmp_community: str = Field(default="public")
	snmp_port: int = Field(default=161)
	snmp_version: str = Field(default="2c")
	location: Optional[str] = Field(default=None)


class PrinterCreate(PrinterBase):
	pass


class PrinterRead(PrinterBase):
	id: int
	online: bool
	last_seen_at: Optional[datetime]
	sys_name: Optional[str]
	printer_name: Optional[str]
	hr_device_status: Optional[int]
	status_text: Optional[str]
	created_at: datetime
	updated_at: datetime

	model_config = ConfigDict(from_attributes=True)


class SupplyRead(BaseModel):
	id: int
	supply_index: int
	description: Optional[str]
	level: Optional[int]
	max_capacity: Optional[int]
	percent: Optional[int]
	updated_at: datetime

	model_config = ConfigDict(from_attributes=True)


class PrinterWithSupplies(PrinterRead):
	supplies: List[SupplyRead] = []