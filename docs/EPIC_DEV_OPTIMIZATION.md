# Epic: Cloudflare Edge Development Optimization

**Epic ID:** DEV-OPT-001
**Related Issue:** #1

## Executive Summary
This epic focuses on optimizing the `lornu-ai-dev` repository for rapid development and high-performance edge execution on Cloudflare Workers. It establishes the "Dev-at-the-Edge" paradigm, ensuring that developers have a fast, representative environment for prototyping while maintaining alignment with the production-ready Enterprise stack.

## 1. Objectives
*   **Rapid Prototyping**: Optimize the build and deployment process for Cloudflare Workers to reduce iteration time.
*   **Edge Performance**: Fine-tune the Worker configuration for minimal latency and optimal resource usage.
*   **Sync Protocol**: Establish a weekly synchronization process to pull core features from `lornu-ai-dev` into the main `lornu-ai` repo.
*   **A2A Safety**: Ensure shared Protobuf/JSON schemas are strictly enforced to prevent breaking changes between Dev and Enterprise.

## 2. Technical Strategy

### Repository Role
*   **`lornu-ai-dev`**: The "Upstream" for experimental features and UI/UX iteration.
*   **Deployment**: Automated to Cloudflare Workers on every push to `main`.
*   **Schema Enforcement**: shared packages (e.g., in `packages/api`) must maintain compatibility with the containerized backend.

## 3. Implementation Plan

### Phase 1: Infrastructure & Workflow Alignment
*   [ ] **Worker Integration**: Finalize the GitHub -> Cloudflare link for the `lornu-ai-dev` repo.
*   [ ] **Build Optimization**: Refactor the Bun build process in `apps/web` to minimize cold start times.
*   [ ] **CI/CD Hardening**: Implement GitHub Actions in `lornu-ai-dev` to run full test suites before edge deployment.

### Phase 2: Synchronization & Safety
*   [ ] **Upstream Sync Script**: Create a script to facilitate the weekly merge of core features from `lornu-ai-dev` to `lornu-ai`.
*   [ ] **Schema Validation**: Implement automated checks to ensure Agent communication schemas remain consistent across both repos.

### Phase 3: Developer Experience (DX)
*   [ ] **Local Emulation**: Improve the `wrangler dev` experience to perfectly match the edge environment.
*   [ ] **Documentation**: Update the root `README.md` to reflect the "Dev-First" nature of this repository.

## 4. User Stories / Tasks

| ID | Title | Description | Est. Effort |
| :--- | :--- | :--- | :--- |
| **STORY-1** | Optimize Bun Build for Edge | Minimize the Worker bundle size and optimize tree-shaking for faster deployments and cold starts. | Medium |
| **STORY-2** | Establish Weekly Sync Workflow | Document and script the process for merging verified features back to the Enterprise `lornu-ai` repo. | Medium |
| **STORY-3** | A2A Schema Governance | Set up a shared schema registry or validation tool to prevent drift in Agent-to-Agent communication. | High |
| **STORY-4** | Edge-First CI Pipeline | Build a CI pipeline that prioritizes edge-specific testing (e.g., using Miniflare/Wrangler test runners). | High |
| **STORY-5** | Developer "Sandbox" Setup | Create environment-specific configs (dev/staging) within Cloudflare for isolated feature testing. | Low |

## 5. Risk Management
*   **Risk**: Fragmentation of core logic between repos.
*   **Mitigation**: Strict adherence to the Weekly Sync; keeping the `apps/web` (worker logic) and `packages/` directories as the "source of truth".
*   **Risk**: Cloudflare-specific features leaking into the Enterprise repo.
*   **Mitigation**: The pruning process in `lornu-ai` acts as a gatekeeper; we only pull logic, not environment-specific config.
