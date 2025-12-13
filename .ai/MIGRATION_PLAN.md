# Migration Plan: Moving Legacy App to Subdomain

## Objective
Move the current deployment (served from `../not-sure`) from `lornu.ai` to `rag.lornu.ai`.
This frees up the top-level domain `lornu.ai` for the new product `lornu-ai` (this repository).

## Steps

### 1. Update Legacy Repository (`not-sure`)
The file `../not-sure/wrangler.jsonc` controls the routing for the current Cloudflare Worker.

**Current Configuration:**
```jsonc
"routes": [
    { "pattern": "lornu.ai", "custom_domain": true },
    { "pattern": "www.lornu.ai", "custom_domain": true }
]
```

**Required Change:**
Replace the `routes` block in `../not-sure/wrangler.jsonc` with:

```jsonc
        "routes": [
                {
                        "pattern": "rag.lornu.ai",
                        "custom_domain": true
                }
        ]
```

### 2. Apply Changes to Legacy App
Run these commands to verify and push the change (assuming you are in the `lornu-ai` root):

```bash
# Verify the file exists
ls -F ../not-sure/wrangler.jsonc

# Edit the file (or use your IDE)
# Then commit:
cd ../not-sure
git checkout -b migrate-domain
# ... make changes ...
git commit -am "chore: migrate domain to rag.lornu.ai"
git push origin migrate-domain
# Merge to main to deploy
```

### 3. Update New Repository (`lornu-ai`)
1. Configure `apps/web/wrangler.toml` in this repo to claim `lornu.ai`.
2. Push to `main` to deploy the new "Coming Soon" or MVP page to the main domain.
