# Migrate to the Orchestration Cluster API — Name changes and mappings

The following table shows key attribute name changes from V1 to V2:

| **V1**           | **V2**                  | **Notes**                                                                           |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `id`             | `[entity]Id`            | Keys now include entity prefix (for example, `userTaskKey`, `processDefinitionId`). |
| `key`            | `[entity]Key`           | Converted from `int64` to `string` with entity prefix.                              |
| `bpmnProcessId`  | `processDefinitionId`   | Unified naming convention.                                                          |
| `processName`    | `processDefinitionId`   | Unified naming convention.                                                          |
| `decisionKey`    | `decisionDefinitionKey` | Unified naming convention.                                                          |
| `dmnDecisionKey` | `decisionDefinitionKey` | Unified naming convention.                                                          |
| `decisionId`     | `decisionDefinitionId`  | Unified naming convention.                                                          |
| `dmnDecisionId`  | `decisionDefinitionId`  | Unified naming convention.                                                          |

**General naming conventions:**

- Keys and IDs contain the full entity name as prefix to avoid confusion (for example, `processDefinitionKey` instead of `processKey`).
- Entity attributes have no prefix within their own entity, but use prefixes when referenced from other entities.
- All key fields are now `string` type instead of `int64`.

<!--- Insert Operate section with V1 endpoint and V2 endpoint to use with input/output adjustments --->

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
