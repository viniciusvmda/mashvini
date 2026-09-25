---
paths: ["packages/frontend/**/*.test.*"]
---

# Frontend test rules

- Tests are colocated next to the file they test (e.g. `HealthStatus.tsx` and
  `HealthStatus.test.tsx` in the same folder), never in a separate `__tests__/` tree.
- Test case names are written in third person without a "should" prefix, e.g.
  `it("renders Healthy when the API responds", ...)`, not
  `it("should render Healthy...", ...)`.
- Render components that depend on server state with `renderWithClient(ui, { queryFn })` from
  `src/test/renderWithClient.tsx`. It builds a `QueryClient` whose default `queryFn` resolves
  or rejects as needed (`retry: false`) and wraps the UI in `QueryClientProvider`,
  `MemoryRouter`, and `Toaster`. Don't build `QueryClient`/`QueryClientProvider` inline in
  tests, and never use `vi.fn`/`vi.mock` to stub the API call itself.
- 2-space indentation for TypeScript code.
