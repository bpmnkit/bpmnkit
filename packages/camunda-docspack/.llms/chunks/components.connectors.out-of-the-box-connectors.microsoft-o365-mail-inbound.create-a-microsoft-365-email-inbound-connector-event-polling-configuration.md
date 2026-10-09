# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Polling configuration

Configure how frequently the connector checks for new emails using the **Polling Interval** field. Specify the time between polls in ISO 8601 duration format (for example, `PT30S` for 30 seconds, `PT5M` for 5 minutes). Review [how to configure a time duration](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events/timer-events#time-duration) for details on the format.

**Tip**
Choose an appropriate polling interval based on your use case. More frequent polling increases API usage but provides faster response times.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
