# @bpmnkit/core — Connectors — `@bpmnkit/core/connectors`

The Camunda 8 out-of-the-box connector catalog and deterministic element-template
application. It sits behind its own subpath because its data is about 100 KB gzipped: code
that imports only `@bpmnkit/core` does not bundle it.

```typescript
import { applyConnectorTemplate, searchConnectors } from "@bpmnkit/core/connectors"

searchConnectors("slack")[0]?.requiredInputs // what the template will ask for

const { serviceTask, problems } = applyConnectorTemplate("io.camunda.connectors.HttpJson.v2", {
  url: "https://api.example.com/orders",
})
// serviceTask: builder options — task type, input mappings, headers, template stamp
```

`findConnectorCards(query)` answers a request with **connector cards**: one operation each,
with only the inputs it uses and the values that select it, as `formatConnectorCard` writes it
for a prompt. See [`@bpmnkit/connectors`](/docs/packages/connectors#connector-cards) for the
details.

**API cards** do the same for the REST connector and systems without a dedicated connector:
the real base URL, authentication and endpoints of an HTTP API. Core has their shape
(`ApiService`) and the functions that pick, format and apply them. The data is the
[API index](/docs/packages/connector-gen#api-index) of `@bpmnkit/connector-gen`, which is
too large for core. See [`@bpmnkit/connectors`](/docs/packages/connectors#api-cards).

The bundled templates leave out icons, groups, tooltips and placeholders, which only a
property panel draws, so an applied element carries no `zeebe:modelerTemplateIcon`.
[`@bpmnkit/connectors`](/docs/packages/connectors) has the same API with those parts added
back. It is the one to use in an editor.

---
Source: https://bpmnkit.com/docs/packages/core
