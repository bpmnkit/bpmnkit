# Configuration — Disabling Individual Connectors

To disable individual connectors you can provide a comma separated list to `CONNECTOR_INBOUND_DISABLED`
and `CONNECTOR_OUTBOUND_DISABLED` respectively. These list must contain the _connector type_ (e.g. `io.camunda:http-json:1`).
To disable two outbound connectors, you can set the environment variable as follows:

```bash
CONNECTOR_OUTBOUND_DISABLED=io.camunda:example:1,com.acme:custom-connector:2
```

This can be found as the `<zeebe:taskDefinition type="io.camunda:http-json:1"/>` in the BPMN XML, the `zeebe:taskDefinition`
property [in the element template](https://github.com/camunda/connectors/blob/8d2304754e202b56ae8c821746e99e1e9ef50c73/connectors/http/rest/element-templates/http-json-connector.json#L48)
or in the `OutboundConnector` annotation for outbound connectors.
The inbound connector type can be found as `<zeebe:property name="inbound.type" value="io.camunda:webhook:1" />`,
the `inbound.type` property [in the element template](https://github.com/camunda/connectors/blob/8d2304754e202b56ae8c821746e99e1e9ef50c73/connectors/webhook/element-templates/webhook-connector-start-message.json#L51)
or in the `InboundConnector` annotation.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
