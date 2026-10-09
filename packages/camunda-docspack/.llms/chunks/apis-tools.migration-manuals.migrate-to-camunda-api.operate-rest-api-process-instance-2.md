# Migrate to the Orchestration Cluster API — Operate REST API — Process instance (2)

- No input adjustments.

Response structure changes.

| **Field**      | **Change Type** | **Notes**                                                                         |
| -------------- | --------------- | --------------------------------------------------------------------------------- |
| Response items | Changed         | Now type `object` instead of `string`.                                            |
| Response items | Moved           | Now under `items` array.                                                          |
| V1 recreation  | Info            | Collect `sequenceFlowId` of type `string` from all objects to recreate V1 result. |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
