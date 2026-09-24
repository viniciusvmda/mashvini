#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty')"

if [[ -z "$file_path" ]]; then
    exit 0
fi

if [[ "$file_path" != *.py ]]; then
    exit 0
fi

if [[ "$file_path" != *packages/backend/* ]]; then
    exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
backend_dir="$repo_root/packages/backend"
relative_file="${file_path#*packages/backend/}"

cd "$backend_dir"

if ! uv run ruff format "$relative_file" 1>&2; then
    echo "ruff format failed for $relative_file" >&2
    exit 2
fi

if ! uv run ruff check --fix "$relative_file" 1>&2; then
    echo "ruff check failed for $relative_file" >&2
    exit 2
fi

if ! uv run mypy 1>&2; then
    echo "mypy failed" >&2
    exit 2
fi

if ! uv run pytest -q 1>&2; then
    echo "pytest failed" >&2
    exit 2
fi

exit 0
