# HTTP Polling connector

The HTTP Polling connector polls an endpoint at regular intervals, enabling periodic data fetching as an intermediate step in your BPMN processes.

The **HTTP Polling connector** polls an endpoint at regular intervals, enabling periodic data fetching as an intermediate step in your BPMN processes. This connector is built on top of the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest), ensuring consistent functionality and reliability.

**Caution**
If you use the HTTP Polling connector, ensure you do not have any process variable named in the list below, as these are reserved words for this connector:

- body, url, method, headers, authentication, queryParameters, connectionTimeoutInSeconds, httpRequestInterval

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/polling
