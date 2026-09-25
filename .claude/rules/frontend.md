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
- Status feedback uses Sonner toasts: call `toast.success`, `toast.warning`, or `toast.error`
  from `sonner`. `<Toaster />` is mounted once in `App.tsx`, so don't add per-feature toast
  components.
- `src/ui/` holds vendored shadcn/ui primitives (added with `npx shadcn@latest add`). They keep
  shadcn's kebab-case filenames and are exempt from the feature-folder, naming, and
  export-placement rules. Don't edit them beyond what integration needs.
- shadcn/ui primitives default to compact text sizes (e.g. `Card` sets `text-xs`, `Badge` sets
  `text-[0.625rem]`) meant for dense, desktop dashboard UI. Since the main target device is a
  tablet read at arm's length (see `docs/decisions/01-frontend.md`), feature code must not
  inherit those sizes for primary content: set an explicit size (`text-base` or larger for
  body text, `text-lg`+ for emphasized values like prices) on the element that renders it,
  rather than relying on the primitive's default. The same applies to `Button`: its largest
  built-in `size` variant (`lg`, `h-8`) is still tablet-small, so a primary/emphasized action
  button (e.g. "Finalize order") needs an explicit larger `className` (e.g. `h-12 px-6
  text-base`) instead.
- TanStack Query deprecates its imperative `QueryClient` methods over time in favor of a
  smaller set of replacements (e.g. `fetchQuery`/`ensureQueryData` → `query`,
  `fetchInfiniteQuery`/`ensureInfiniteQueryData` → `infiniteQuery`). Don't call a method
  flagged `@deprecated` in its type signature; use the replacement it points to instead.
- Extract a pure formatting/calculation function used by a component (e.g. currency, date
  formatting) into its own colocated sibling module with a dedicated test, instead of defining
  it inline in the component file. Keep it in the same feature folder unless a second feature
  needs it too.

See `packages/frontend/README.md` for folder structure, technologies, and commands.
