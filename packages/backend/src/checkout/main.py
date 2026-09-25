import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from checkout.catalog.router import router as catalog_router
from checkout.config.env import get_settings
from checkout.health.router import router as health_router


def create_app() -> FastAPI:
    logging.basicConfig(level=logging.INFO)

    settings = get_settings()
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(catalog_router)

    return app


app = create_app()
