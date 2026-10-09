# Test files — Manual editing — Test case structure

Test files follow the [CPT JSON test cases schema](https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases). Test mode adds two optional fields to that schema, `processId` and `metadata`, to link the file to a BPMN process and track test coverage.

```json
{
  "$schema": "https://camunda.com/json-schema/cpt-test-cases/8.9/schema.json",
  "processId": "order-fulfillment-process",
  "testCases": [
    {
      "name": "Happy path order processing",
      "description": "Customer places an order that is processed successfully.",
      "instructions": [
        // Array of instruction objects
      ],
      "metadata": {
        // Optional - for use in Test mode only
        "processInstanceId": 12345,
        "coveredFlowNodes": [
          { "flowNodeId": "startEvent", "elementType": "START_EVENT" },
          { "flowNodeId": "processOrder", "elementType": "SERVICE_TASK" }
        ],
        "coveredSequenceFlows": ["flow1", "flow2"]
      }
    },
    {
      "name": "Error handling tests",
      "instructions": [
        // Array of instruction objects for error case
      ]
    }
  ]
}
```

**Top-level fields**

| Field       | Required | Description                                                                                                        |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `processId` | Yes      | Test-mode-specific field. The ID of the BPMN process definition the test cases run against. Required by Test mode. |
| `testCases` | Yes      | An array of test case objects.                                                                                     |

**Test case fields**

| Field          | Required | Description                                                                                                     |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `name`         | Yes      | A descriptive name for the test case.                                                                           |
| `description`  | No       | A human-readable description of the test case.                                                                  |
| `instructions` | Yes      | An array of instruction objects that define the test steps.                                                     |
| `metadata`     | No       | Used by Test mode to show coverage and process instance details. Camunda does not recommend editing this field. |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files
