# Ad-hoc Tools Schema Resolver connector — Prerequisites

The following prerequisites are required to use this connector:

| Prerequisite       | Description                                                                 |
| :----------------- | :-------------------------------------------------------------------------- |
| Ad-hoc sub-process | Your process must contain an ad-hoc sub-process whose ID you can reference. |


## Create an Ad-hoc Tools Schema connector task

1. Create a service task.
2. [Apply](https://docs.camunda.io/docs/next/components/connectors/use-connectors/outbound) the **Ad-hoc Tools Schema** element template.
3. Configure the **Ad-hoc sub-process ID** to reference the element ID of the ad-hoc sub-process.
4. Configure [a result variable or a result expression](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#variableresponse-mapping) to map the
   connector results to process variables.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-ahsp-tools-schema-resolver
