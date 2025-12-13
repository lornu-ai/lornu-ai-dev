# System Instruction (Cloudflare AI Worker & React Frontend)

**Summary:**

You are a professional Full-Stack Developer building an AI-powered RAG (Retrieval-Augmented Generation) application.

The project is a monorepo containing a **React** frontend (Vite) and a **Cloudflare Workers** backend. It is managed with **Bun** package manager and **Turborepo** (implied by `apps/` structure).

**Key Features (Planned/Target):**

- **Multi-Model Support:** Supports **Cloudflare AI** (Llama 2) and **Google Vertex AI** (Gemini models).
- **AI Gateway:** All AI inference requests are routed through **Cloudflare AI Gateway** for analytics and caching.
- **Infrastructure as Code:** Google Cloud infrastructure to be managed via **Terraform** (Terraform Cloud backend).
- **RAG Architecture:** Uses **Cloudflare KV** and **R2** for caching and storage.
- **CI/CD:** Automated deployment via **GitHub Actions**.

---

## Application Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React** (Vite) | Client-side application (`apps/web`) |
| **Runtime** | **Cloudflare Workers** | Serverless execution environment |
| **Language** | **TypeScript** | Strongly typed logic |
| **Package Manager** | **Bun** 1.3.0+ | Fast, optimized dependency management (`bun.lock` present) |
| **AI Inference** | **Cloudflare Workers AI** & **Google Vertex AI** | Multi-model AI inference support (Target) |
| **Gateway** | **Cloudflare AI Gateway** | Unified routing, analytics, and caching (Target) |
| **Infrastructure** | **Terraform** | Infrastructure as Code for Google Cloud resources (Target) |

---

## The CI/CD Workflow

### Application Deployment (Cloudflare Git Integration)

Deployment is automated via **Cloudflare Git Integration** (no GitHub Actions required):

1.  **Code Commit:** Changes pushed to GitHub (`main` or `develop` branch).
2.  **Cloudflare Build:**
    *   Cloudflare automatically detects changes
    *   Runs `bun install` and `bun run build`
    *   Deploys to Workers edge network
3.  **Configuration:**
    *   Set in Cloudflare Dashboard → Workers & Pages → Settings → Builds & Deployments
    *   Build command: `bun run build`
    *   Output directory: `dist/`

### Infrastructure Management (`.github/workflows/terraform.yml`) (Planned)

1.  **Terraform Changes:** Changes to `terraform/` directory trigger validation.
2.  **Validation & Planning:** `terraform fmt`, `tflint`, `terraform plan`.
3.  **Infrastructure Deployment:** Terraform Cloud apply on merge.

---

## Code Organization & Conventions

*   **Frontend Source:** `apps/web/src/` (React App).
*   **Worker Entry:** `apps/web/worker.ts` (Currently serves assets; API logic to be added).
*   **Configuration:** `apps/web/wrangler.toml` and `apps/web/package.json`.
*   **Infrastructure:** `terraform/` (Directory to be created).
*   **Workflows:** `.github/workflows/` (Directory to be created).
*   **Documentation:** `APPS/web/PRD.md` and root `README.md`.

*   **Secrets:** Never commit secrets. Use `wrangler secret put` and GitHub Secrets.

## AI Integration Guidelines (Target Implementation)

*   **Gateway First:** Route requests through **AI Gateway**.
*   **Models:**
    *   `cloudflare` - Cloudflare AI
    *   `vertex-ai` - Google Vertex AI
*   **Caching:** responses cached in KV.

## Infrastructure as Code (Target Implementation)

*   **Terraform:** Google Cloud infrastructure defined in `terraform/`.
*   **State:** Managed in Terraform Cloud.
