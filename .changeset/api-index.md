---
"@bpmnkit/connector-gen": minor
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
"@bpmnkit/cli": minor
"@bpmnkit/drop": minor
---

API cards: real endpoints of HTTP APIs for the REST connector, from an offline index.

- **`@bpmnkit/connector-gen/api-index`**: the base URL, authentication and endpoints of 78 HTTP APIs (20,327 operations), built from the catalog's OpenAPI specs by `scripts/build-api-index.mjs`. It is one lazily loaded module per service (`API_SERVICES`, `loadApiService`, `loadApiServices`). Specs that state a non-permissive license are left out. Notion's catalog spec URL is fixed.
- **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`):
  - `selectConnectors(…, { apis })` offers the REST connector with an **API card** — the service's best-fitting endpoints — for a task that names a system without a dedicated connector, or one whose connector lacks the operation.
  - On an `http` line, `api=<service>` or a URL under the service's base URL gets the base URL, `{param}`s as FEEL, authentication with a secret placeholder, and required headers (`applyConnectorLines(…, { apis })`). A call the index lacks becomes a question.
  - New exports: `apiServicesIn`, `findApiOperations`, `rankApiOperations`, `findApiOperation`, `formatApiCard`, `formatApiOperation`, `apiUrl`, `apiAuthValues`, `apiSecretNames`, `apiBrand` and the `ApiService` types.
- **`@bpmnkit/cli`**: `casen connector api "<request>"` prints the endpoints of the API a request names.
- **`@bpmnkit/drop`**: the connect pass loads the services a request names and shows their endpoints to the model. `bench:generate` scores `mustCallUrls`, with new Notion and GitHub-workflow-runs golden prompts.
