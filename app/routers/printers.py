from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from ..database import get_session
from ..models import Printer, PrinterSupply
from ..schemas import PrinterCreate, PrinterRead, SupplyRead, PrinterWithSupplies


templates = Jinja2Templates(directory="/workspace/app/templates")
router = APIRouter()


# UI routes
@router.get("/", include_in_schema=False)
def home(request: Request, session: Session = Depends(get_session)):
	printers = session.query(Printer).order_by(Printer.id.asc()).all()
	return templates.TemplateResponse("index.html", {"request": request, "printers": printers})


@router.get("/printers/{printer_id}", include_in_schema=False)
def printer_detail(printer_id: int, request: Request, session: Session = Depends(get_session)):
	printer = session.get(Printer, printer_id)
	if not printer:
		raise HTTPException(status_code=404, detail="Printer not found")
	return templates.TemplateResponse("printer_detail.html", {"request": request, "printer": printer})


@router.post("/printers/add", include_in_schema=False)
def add_printer_form(
	request: Request,
	ip_address: str = Form(...),
	name: str | None = Form(default=None),
	snmp_community: str = Form(default="public"),
	snmp_port: int = Form(default=161),
	location: str | None = Form(default=None),
	session: Session = Depends(get_session),
):
	if session.query(Printer).filter(Printer.ip_address == ip_address).first():
		raise HTTPException(status_code=400, detail="Printer with this IP already exists")
	printer = Printer(
		ip_address=ip_address,
		name=name,
		snmp_community=snmp_community,
		snmp_port=snmp_port,
		location=location,
	)
	session.add(printer)
	session.commit()
	return RedirectResponse(url="/", status_code=303)


# API routes
@router.get("/api/printers", response_model=List[PrinterRead])
def list_printers(session: Session = Depends(get_session)):
	printers = session.query(Printer).order_by(Printer.id.asc()).all()
	return printers


@router.post("/api/printers", response_model=PrinterRead)
def create_printer(payload: PrinterCreate, session: Session = Depends(get_session)):
	if session.query(Printer).filter(Printer.ip_address == payload.ip_address).first():
		raise HTTPException(status_code=400, detail="Printer with this IP already exists")
	printer = Printer(
		name=payload.name,
		ip_address=payload.ip_address,
		snmp_community=payload.snmp_community,
		snmp_port=payload.snmp_port,
		snmp_version=payload.snmp_version,
		location=payload.location,
	)
	session.add(printer)
	session.commit()
	session.refresh(printer)
	return printer


@router.get("/api/printers/{printer_id}", response_model=PrinterWithSupplies)
def get_printer(printer_id: int, session: Session = Depends(get_session)):
	printer = session.get(Printer, printer_id)
	if not printer:
		raise HTTPException(status_code=404, detail="Printer not found")
	return printer


@router.delete("/api/printers/{printer_id}")
def delete_printer(printer_id: int, session: Session = Depends(get_session)):
	printer = session.get(Printer, printer_id)
	if not printer:
		raise HTTPException(status_code=404, detail="Printer not found")
	session.delete(printer)
	session.commit()
	return {"ok": True}


@router.get("/api/printers/{printer_id}/supplies", response_model=List[SupplyRead])
def get_printer_supplies(printer_id: int, session: Session = Depends(get_session)):
	printer = session.get(Printer, printer_id)
	if not printer:
		raise HTTPException(status_code=404, detail="Printer not found")
	return session.query(PrinterSupply).filter(PrinterSupply.printer_id == printer_id).order_by(PrinterSupply.supply_index.asc()).all()