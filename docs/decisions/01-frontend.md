# 01 - Frontend

- React over Vue since I have more proficiency in React.
- TypeScript over JavaScript to catch errors at development time rather than runtime and to improve readability since we know what is returned or received as parameters.
- CSR over SSR since we don't have any requirement for SEO.
- Vite over Webpack for faster local development.
- Biome over ESLint + Prettier since it already combines linting and formatting in the same tool.
- React Compiler for simplification and performance gain over manual optimization with useMemo/useCallback.
- TanStack Query for API calls and server state management (loading/error/success) to simplify the implementation over implementing the state management manually with `useEffect` + context.
- Tailwind CSS for simplicity and development speed. It will make it easier to cover the portability requirement since it uses a mobile-first approach with pre-built classes.
- shadcn/ui over a fully-styled kit (e.g., MUI) or a bare headless library since it ships accessible-by-default components copied into the repo instead of an npm dependency, saving time on interaction patterns and accessibility without fighting Tailwind's utility approach.
- React Testing Library over Enzyme for testing components since it queries by role/text and asserts on rendered output instead of internal state/props, catching regressions the way a real user would hit them and reinforcing the accessibility requirement. Vitest over Jest for test speed since it reuses Vite's own transform pipeline instead of a separate one.
- Feature-based (screaming) architecture: order/catalog folders instead of components/service/repository. Tests live at the same folder of the files.
- No dedicated logging library on the frontend behind a small wrapper is enough since there's no log shipping endpoint.
- Docker container for the application inside docker-compose with the rest of the services for easier setup and to cover the portability requirement.