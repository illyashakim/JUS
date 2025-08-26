from __future__ import annotations

import threading
import time
from datetime import datetime
from typing import Callable

from sqlalchemy.orm import Session

from .config import settings
from .models import Printer, PrinterSupply
from .snmp_client import fetch_printer_snapshot


class Poller:
	def __init__(self, session_factory: Callable[[], Session], interval_seconds: int | None = None):
		self._session_factory = session_factory
		self._interval = interval_seconds or settings.poll_interval_seconds
		self._thread: threading.Thread | None = None
		self._stop_event = threading.Event()

	def start(self) -> None:
		if self._thread and self._thread.is_alive():
			return
		self._stop_event.clear()
		self._thread = threading.Thread(target=self._run_loop, name="printer-poller", daemon=True)
		self._thread.start()

	def stop(self) -> None:
		self._stop_event.set()
		if self._thread and self._thread.is_alive():
			self._thread.join(timeout=5)

	def _run_loop(self) -> None:
		while not self._stop_event.is_set():
			self._tick()
			self._stop_event.wait(self._interval)

	def _tick(self) -> None:
		session = self._session_factory()
		try:
			printers: list[Printer] = session.query(Printer).all()
			for printer in printers:
				self._poll_printer(session, printer)
				# Commit after each printer to persist partial progress
				session.commit()
		except Exception:
			session.rollback()
		finally:
			session.close()

	def _poll_printer(self, session: Session, printer: Printer) -> None:
		try:
			data = fetch_printer_snapshot(printer.ip_address, printer.snmp_community, printer.snmp_port)
			printer.sys_name = data.get("sys_name")
			printer.printer_name = data.get("printer_name")
			hr = data.get("hr_device_status")
			printer.hr_device_status = int(hr) if isinstance(hr, int) else None
			printer.status_text = data.get("status_text")
			printer.online = True
			printer.last_seen_at = datetime.utcnow()

			# Update supplies: upsert by supply_index
			existing = {s.supply_index: s for s in printer.supplies}
			for s in data.get("supplies", []):
				idx = int(s.get("index") or -1)
				item = existing.get(idx)
				if not item:
					item = PrinterSupply(printer_id=printer.id, supply_index=idx)
					session.add(item)
				item.description = s.get("description")
				item.level = s.get("level")
				item.max_capacity = s.get("max_capacity")
				item.percent = s.get("percent")
		except Exception:
			printer.online = False