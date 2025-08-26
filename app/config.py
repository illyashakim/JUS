from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
	app_title: str = Field(default="SNMP Printer Monitor")
	database_url: str = Field(default="sqlite:////workspace/data/app.db")
	poll_interval_seconds: int = Field(default=300)
	snmp_timeout_seconds: int = Field(default=1)
	snmp_retries: int = Field(default=1)

	class Config:
		env_prefix = "PRN_"


settings = Settings()