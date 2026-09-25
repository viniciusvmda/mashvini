import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from checkout.catalog.exceptions import ItemNotFoundError
from checkout.catalog.router import router as catalog_router
from checkout.config.env import get_settings
from checkout.database.session import get_engine
from checkout.health.router import router as health_router
from checkout.order.exceptions import (
    ItemNotAvailableError,
    OrderExpiredError,
    OrderNotFoundError,
    OrderNotPayableError,
)
from checkout.order.expiry import run_expiry_sweep
from checkout.order.router import router as order_router
from checkout.payment.exceptions import PaymentDeclinedError, PaymentGatewayError
from checkout.payment.router import router as payment_router

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ItemNotFoundError)
    def handle_item_not_found(request: Request, exc: ItemNotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ItemNotAvailableError)
    def handle_item_not_available(request: Request, exc: ItemNotAvailableError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(OrderNotFoundError)
    def handle_order_not_found(request: Request, exc: OrderNotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(OrderNotPayableError)
    def handle_order_not_payable(request: Request, exc: OrderNotPayableError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(OrderExpiredError)
    def handle_order_expired(request: Request, exc: OrderExpiredError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(PaymentDeclinedError)
    def handle_payment_declined(request: Request, exc: PaymentDeclinedError) -> JSONResponse:
        return JSONResponse(status_code=402, content={"detail": str(exc)})

    @app.exception_handler(PaymentGatewayError)
    def handle_payment_gateway_error(request: Request, exc: PaymentGatewayError) -> JSONResponse:
        return JSONResponse(status_code=502, content={"detail": str(exc)})


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    sweep_task = asyncio.create_task(run_expiry_sweep(lambda: Session(get_engine())))

    yield

    sweep_task.cancel()
    with suppress(asyncio.CancelledError):
        await sweep_task


def create_app() -> FastAPI:
    logging.basicConfig(level=logging.INFO)

    settings = get_settings()
    app = FastAPI(lifespan=lifespan)

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
    app.include_router(payment_router)

    return app


app = create_app()
