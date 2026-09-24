---
paths: ["packages/frontend/**/*.test.*"]
---

# Frontend test rules

- Tests are colocated next to the file they test (e.g. `HealthStatus.tsx` and
  `HealthStatus.test.tsx` in the same folder), never in a separate `__tests__/` tree.
- Test case names are written in third person without a "should" prefix, e.g.
  `it("renders Healthy when the API responds", ...)`, not
  `it("should render Healthy...", ...)`.
- Mock API calls by giving a `QueryClient` a default `queryFn` (via
  `defaultOptions.queries.queryFn`) that resolves or rejects as needed, and wrapping the
  component under test in that client's `QueryClientProvider`. Never use `vi.fn`/`vi.mock`
  to stub the API call itself.
- 2-space indentation for TypeScript code.
