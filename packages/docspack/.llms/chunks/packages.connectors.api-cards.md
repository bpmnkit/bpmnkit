# @bpmnkit/connectors — API cards

Most systems have no dedicated connector. The REST connector can still call them, but only
with the right base URL, path and authentication. The
[API index](/docs/packages/connector-gen#api-index) has these for about 80 HTTP APIs, built
offline from their OpenAPI specs. Pass the services the request names as `apis`, and a task
that names one of them gets the REST connector first, plus an **API card** with its
best-fitting endpoints:

```typescript
import { API_SERVICES, loadApiServices } from "@bpmnkit/connector-gen/api-index";
import { apiServicesIn, formatConnectorSelection, selectConnectors } from "@bpmnkit/connectors";

const text = "When someone signs up, create a Stripe customer";
const apis = await loadApiServices(apiServicesIn(text, API_SERVICES));
const selection = selectConnectors(
  { text, tasks: [{ id: "customer", name: "Create customer", type: "serviceTask" }] },
  { apis },
);
formatConnectorSelection(selection);
// customer (Create customer):
// http — Send REST Request | url* | …
// api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN
// POST /v1/customers — Create a customer | form body: name email description address …
```

- **A dedicated connector comes first.** The API card is left out when a dedicated
  connector for the system has an operation that fits as much of the task's name. GitHub's
  connector creates issues, so "Create GitHub issue" gets it. It has nothing for workflow
  runs, so "List GitHub workflow runs" gets the API card.
- **Tasks only.** Events get no API card.
- **Ranking.** `findApiOperations(service, text)` ranks endpoints by the words of their
  summary, then of their path. A verb picks the method ("Create" → POST, "List" → GET), and
  a path that ends in a word of the task wins over a deeper one.
- **Services in text.** `apiServicesIn(text, summaries)` finds the services a text names by
  their brand. A brand that is also an everyday word, like "box" or "square", counts only as
  "Box API".

```typescript
import { formatConnectorSelection, selectConnectors } from "@bpmnkit/connectors";

const selection = selectConnectors({
  text: "Every hour, list open GitHub issues and post a summary to Slack",
  tasks: [
    { id: "list", name: "List open issues", type: "serviceTask" },
    { id: "post", name: "Post summary to Slack", type: "serviceTask" },
  ],
});
formatConnectorSelection(selection); // the prompt block, one task per paragraph
```

---
Source: https://bpmnkit.com/docs/packages/connectors
