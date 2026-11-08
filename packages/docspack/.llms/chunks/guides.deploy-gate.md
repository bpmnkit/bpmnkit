# The Deploy Gate

BPMN Kit generates BPMN that deploys on Camunda 8. When the input leaves out something Camunda 8
needs (a job type, a message name, a correlation key, a timer's time, a condition on a gateway
branch), the result is refused with a clear error instead of written. Placeholder values are an
explicit opt-in.

The check is Zeebe's own: the rules Zeebe runs when it receives a deployment (`zeebe/*`), plus its
XML schema stage, on the serialized XML. A model the gate accepts is one Zeebe accepts.


## The API

```typescript
import { Bpmn, DeployabilityError, assertDeployable, assertDeployableXml } from "@bpmnkit/core"

try {
  const { definitions, placeholders, warnings } = assertDeployable(defs)
} catch (err) {
  if (err instanceof DeployabilityError) {
    console.error(err.message)      // the lines below
    err.findings                    // the error findings, in the validator's order
    err.camundaVersion              // "8.10"
  }
}

// The bytes as they are, for XML you did not serialize yourself (a file, a model's answer):
assertDeployableXml(readFileSync("order.bpmn", "utf8"))
```

| Function | Checks | Returns | Throws |
|---|---|---|---|
| `assertDeployable(defs, options?)` | `defs`, serialized | `{ definitions, placeholders, warnings }`: the input, or a filled copy (the input is never mutated) | `DeployabilityError` |
| `assertDeployableXml(xml, options?)` | the XML string | the warnings | `DeployabilityError` |
| `validateDeployable(defs, options?)` / `validateDeployableXml(xml, options?)` | the same rules | every finding, without throwing | — |

Options: `camundaVersion` (default: the model's `modeler:executionPlatformVersion`, else the newest
supported version), `placeholders` (`assertDeployable` only), and a `resolver` for the other
resources of the same deployment. The Rust crates have the same functions
(`bpmnkit_compat::zeebe::{assert_deployable, assert_deployable_xml}`) with byte-identical messages.

---
Source: https://bpmnkit.com/docs/guides/deploy-gate
