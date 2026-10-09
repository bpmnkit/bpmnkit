# HTTP Polling connector — Prerequisites

Ensure that you have:

- An HTTP endpoint that supports polling.
- Necessary credentials if the endpoint demands authentication.

**Note: Execution Exception Handling**
If the HTTP Polling connector encounters an execution exception while polling, it will ignore the exception and attempt to execute the request again after the next interval delay. Ensure to monitor your logs for any recurring issues.


## Setting up the HTTP Polling connector

1. Add an **Intermediate Event** to your BPMN diagram.
2. Change its template to the **HTTP Polling connector**.
3. Populate all mandatory fields, like the endpoint URL, polling interval, and required headers.
4. Complete your BPMN diagram.
5. Deploy the diagram to activate the **HTTP Polling connector**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/polling
