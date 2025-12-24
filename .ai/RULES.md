# Project Rules & Context (Lornu AI)

## Tech Stack
- **Frontend:** React + Vite (located in `apps/web`)
- **Package Manager (JS):** **Bun** (Always use `bun install`, `bun run`, `bunx`). NEVER use npm/yarn.
- **Backend/Edge Logic:** Cloudflare Worker (`apps/web/worker.ts`).
- **Deployment:** Cloudflare Workers (via GitHub Integration).

## Directory Structure
- `apps/web`: Frontend application and Cloudflare Worker logic.
- `packages/`: Shared packages and Agent logic.
- `docs/`: Project documentation.

## Workflow Rules
1. **Git:**
   - Main branch: `main` (Production)
   - Develop branch: `develop` (Staging/Integration)
   - Feature branches: `feat/` or `feature/`
   - **Never push directly to main/develop.** Always use PRs.
2. **Testing:**
   - Frontend: `bun run test` (Vitest), `bun run test:e2e` (Playwright).
   - Backend: `uv run pytest`.
3. **Linting:**
   - Frontend: ESLint + Prettier.
   - Backend: Ruff (`uv run ruff check .`).

## Specific Configurations
- **Tailwind:** Configured in `apps/web/tailwind.config.js`. Uses `oklch` colors.
- **Worker Configuration:** Managed via `apps/web/wrangler.toml`.
