# 02 - Backend

- Python over Node.js since Python is most used by the company.
- `uv` to pin both the Python and dependency versions and cover the portability requirement. Rejected `pip`, `requirements.txt`, `venv`, and other alternatives since they don't have this capability and resolve versions at installation time.
- `ruff` over other dependencies for linting and formatting since it combines both features into a single dependency. Rejected `flake8` and others.
- `src/checkout` folder instead of a flat structure to enforce importing the package and catch packaging bugs at development time. Flat projects import the local uninstalled source and might miss packaging issues.
- `mypy` over `pyright` since it can address framework-specific typing (e.g., Pydantic, SQLAlchemy). `pyright` doesn't offer plugins for these libraries and, consequently, produces false-positive errors on their annotations.
- Pydantic schema for input and output objects
- Skipped Business models: mapped ORM model directly to output schema and vice-versa for less boylerplate
- FastAPI over Flask and Django for this checkout API because it sits between Flask, which is minimal, and Django, which is the opposite extreme: an ORM, migrations, an admin UI, and templating all bundled together, which is more than this small API needs. In FastAPI, validation and serialization come from type hints and Pydantic natively, async support is built in from the start, and it stays out of the way with no admin/templating machinery.
- SQLAlchemy over Peewee and raw SQL for the ORM layer because it's fully typed, bundles Core and ORM in one library, and ships Alembic as its own first-party migration tool that will be useful for configuring the migrations and seeds used in the validation of this application.
- Pytest over unittest for testing since it produces less boilerplate.
- Separate `tests/` folder mirroring `src/checkout` over colocating test files with the implementation since it keeps tests out of the installed package, with no packaging exclusion config needed, and runs them against the installed `checkout` package instead of the local source tree, reinforcing the `src/checkout` decision to catch packaging bugs rather than mask them.
- Python's built-in `logging` module over `structlog`/`loguru` since it needs no extra dependency and is enough to trace failures with no log aggregation in place.
- Docker container for the application inside docker-compose with the rest of the services for easier setup and to cover the portability requirement.