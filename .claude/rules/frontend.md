---
paths: ["packages/frontend/**"]
---

# Frontend rules

- Screaming, feature-based architecture: organize `src/` by feature (e.g. `health/`,
  `config/`), each with its own components/modules, instead of grouping by technical layer
  (no `components/`, `services/`, `hooks/` catch-all folders).
- Dependencies are exact-pinned: `.npmrc` sets `save-exact=true` so every `npm install` writes
  an exact version, and `package-lock.json` is always committed alongside dependency changes.
- Naming convention:
  - PascalCase for component files (`HealthStatus.tsx`).
  - camelCase for plain TypeScript files (`env.ts`, `queryClient.ts`).
  - kebab-case for folders.
  - `.test.ts` suffix for plain TypeScript tests, `.test.tsx` for component tests.
- Exports go at the bottom of the file: declare with `function`/`const`/`type` first, then a
  single `export { ... }` (and `export type { ... }` for types, kept separate from value
  exports) at the end, except where the framework requires an inline default export.
- No self-explanatory comments. If a comment feels necessary, improve naming or structure
  instead.
- 2-space indentation for TypeScript code.

See `packages/frontend/README.md` for folder structure, technologies, and commands.
