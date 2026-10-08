# @bpmnkit/connector-gen — API index

`@bpmnkit/connector-gen/api-index` is an offline index of the catalog's HTTP APIs. It is built
from their OpenAPI specs, so nothing is fetched at runtime. It holds about 80 services and
20,000 operations. For each service it keeps the base URL and how it authenticates. For each
operation it keeps:

- the method and path;
- a summary of twelve words at most;
- the query parameters, top-level body fields and required headers, required ones marked `*`.

Each service is its own module, so loading Stripe evaluates only Stripe:

```typescript
import { API_SERVICES, loadApiService } from "@bpmnkit/connector-gen/api-index"

API_SERVICES.map((s) => s.id)            // ["github", "cloudflare", "stripe", "notion", …]
const stripe = await loadApiService("stripe")
stripe?.baseUrl                          // "https://api.stripe.com"
stripe?.operations.find((o) => o.path === "/v1/customers" && o.method === "POST")
// { method: "POST", path: "/v1/customers", summary: "Create a customer",
//   body: ["name", "email", "description", …], form: true }
```

[`@bpmnkit/core/connectors`](/docs/packages/connectors#api-cards) turns these into **API
cards** for a model, and completes REST connector calls from them. `casen connector api
"create a stripe customer"` prints the cards.

- **Building.** `pnpm update-api-index` (`scripts/build-api-index.mjs`) fetches each catalog
  spec once. It reads OpenAPI 3 and Swagger 2.
  - The weekly connector-templates workflow runs it and opens a pull request when something
    changed.
  - A spec that cannot be fetched keeps its previous entry.
- **Base URLs.** A spec whose host stands for a tenant's own, like Jira's
  `your-domain.atlassian.net`, has no `baseUrl`; the call needs the full URL.
- **Licenses.** Only specs under a permissive license, or none stated, are indexed. A spec
  that names a non-commercial, copyleft or proprietary license is left out.

---
Source: https://bpmnkit.com/docs/packages/connector-gen
