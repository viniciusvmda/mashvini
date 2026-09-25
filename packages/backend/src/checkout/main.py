import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from checkout.catalog.exceptions import ItemNotFoundError
from checkout.catalog.router import router as catalog_router
from checkout.config.env import get_settings
from checkout.health.router import router as health_router
from checkout.order.exceptions import ItemNotAvailableError
from checkout.order.router import router as order_router


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ItemNotFoundError)
    def handle_item_not_found(request: Request, exc: ItemNotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ItemNotAvailableError)
    def handle_item_not_available(request: Request, exc: ItemNotAvailableError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})


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

    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(catalog_router)
    app.include_router(order_router)

    return app


app = create_app()
