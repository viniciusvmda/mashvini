---
paths: ["packages/backend/**"]
---

# Backend rules

- Screaming, feature-based architecture: organize `src/checkout/` by feature (e.g. `health/`,
  `config/`), each with its own router/module, instead of grouping by technical layer.
- Dependencies are exact-pinned in `pyproject.toml` (`==`), and `uv.lock` is always committed
  alongside dependency changes.
- Naming convention: snake_case for every Python file and every folder under `packages/backend/`.
- Alembic revisions are created with a meaningful, descriptive name:
  `uv run alembic revision -m "add_catalog"`, never a random hex or default message.
- Tests under `tests/` mirror the `src/checkout` structure feature by feature.
- No self-explanatory comments. If a comment feels necessary, improve naming or structure
  instead.
- No docstrings, unless the logic is complex enough that it can't be simplified by extracting
  it into smaller, well-named functions or separate files.
- 4-space indentation for Python code.
- Out schemas that load ORM entities set `model_config = ConfigDict(from_attributes=True)` and
  are built with `model_validate`.

See `packages/backend/README.md` for folder structure, technologies, and commands.
