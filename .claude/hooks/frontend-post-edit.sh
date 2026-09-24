#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty')"

if [[ -z "$file_path" ]]; then
    exit 0
fi

if [[ "$file_path" != *.ts && "$file_path" != *.tsx && "$file_path" != *.css && "$file_path" != *.json ]]; then
    exit 0
fi

if [[ "$file_path" != *packages/frontend/* ]]; then
    exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
frontend_dir="$repo_root/packages/frontend"
relative_file="${file_path#*packages/frontend/}"

cd "$frontend_dir"

if ! npx biome check --write "$relative_file" 1>&2; then
    echo "biome check failed for $relative_file" >&2
    exit 2
fi

if ! npx vitest related --run "$relative_file" 1>&2; then
    echo "vitest related failed for $relative_file" >&2
    exit 2
fi

exit 0
