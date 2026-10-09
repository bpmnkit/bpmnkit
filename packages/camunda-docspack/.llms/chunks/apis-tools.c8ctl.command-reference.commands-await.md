# Command reference — Commands — `await`

Create and await process instance completion (server-side waiting)

**Usage:** `c8ctl await <resource>`

**Resources:** pi (process-instance)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--processDefinitionId` | string |  | Process definition ID (BPMN process ID) |
| `--id` | string |  | Process definition ID (alias for --processDefinitionId) |
| `--bpmnProcessId` | string |  | BPMN process ID (alias for --processDefinitionId) |
| `--businessId` | string |  | Business ID for the process instance (Camunda 8.9+) |
| `--variables` | string |  | JSON variables (or @file.json / @- to read from file/stdin) |
| `--fetchVariables` | boolean |  | Fetch result variables on completion |
| `--requestTimeout` | string |  | Await timeout in milliseconds |

**Examples:**

```bash
c8ctl await pi --id=myProcess --businessId=claim-456        # Create with a Business ID and wait for completion
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
