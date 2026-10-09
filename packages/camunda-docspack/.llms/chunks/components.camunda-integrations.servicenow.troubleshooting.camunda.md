# Troubleshooting — Camunda

| Issue                               | Possible cause                                                         | Recommended action                                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Connector task fails                | Invalid credentials or network connectivity issues.                    | Confirm Camunda API credentials are valid and that the ServiceNow instance is reachable.                     |
| Variables not mapped correctly      | Response fields from ServiceNow are not stored or referenced properly. | Map the entire response object and specific fields explicitly in your BPMN model.                            |
| Process not started from ServiceNow | Correlation keys or message names do not match.                        | Verify that message names and correlation variables are configured correctly in both ServiceNow and Camunda. |
| Timeouts or unexpected errors       | Large payloads or network latency.                                     | Check logs, increase timeout thresholds, and test the ServiceNow API call separately.                        |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/troubleshooting
