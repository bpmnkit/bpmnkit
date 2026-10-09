# Trigger a process from Databricks with a webhook — Route on the risk score

Add an [exclusive gateway](https://docs.camunda.io/docs/next/components/modeler/bpmn/exclusive-gateways/exclusive-gateways) named `Is Fraud Detected?` after the start event, with two outgoing paths:

| Path      | Condition           | Next step                                                              |
| :-------- | :------------------ | :--------------------------------------------------------------------- |
| High risk | Default flow        | Continues into the OpenAI, review, and SendGrid tasks below.           |
| Low risk  | `=riskScore < 0.75` | An end event named `No Fraud Detected`. No email is sent on this path. |

Mark the high-risk path as the default flow, so a transaction goes to manual review if the low-risk condition can't be evaluated. Without a default flow, a missing or non-numeric `riskScore` matches no path and raises an incident at the gateway.

The rest of this guide builds the high-risk path.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
