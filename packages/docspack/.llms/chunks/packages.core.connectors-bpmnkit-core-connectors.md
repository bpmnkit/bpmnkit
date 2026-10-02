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

The bundled templates leave out icons, groups, tooltips and placeholders, which only a
property panel draws, so an applied element carries no `zeebe:modelerTemplateIcon`.
[`@bpmnkit/connectors`](/docs/packages/connectors) has the same API with those parts added
back. It is the one to use in an editor.

---
Source: https://bpmnkit.com/docs/packages/core
