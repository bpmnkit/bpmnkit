# SAP eventing with SAP Advanced Event Mesh (AEM) — SAP Eventing Intermediate Event Connector

### Correlate CloudEvents as BPMN messages

The **SAP Eventing Intermediate Event Connector** injects a CloudEvent from AEM into an active Camunda process instance using [message correlation](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook#correlation).

Any CloudEvent property can be used as a **correlation key** to match incoming event data to the correct process instance.

### Correlation via CloudEvent body

The configuration options of the **Message Start** and **Intermediate Event** connectors are identical, except that the intermediate event requires an additional **Correlation** section.

![Intermediate Message Correlation](./img/eventing-intermediate-correlation.png)

- In the example above, the process variable `ENCOMGridID` must exist within the process instance.
- Its value is compared against the CloudEvent payload (`request.body.FlynnLocationID`).
- If both values match, the CloudEvent is correlated to that process instance.

### Correlation via CloudEvent metadata

Since **HTTP** is used as the transport protocol, the [CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/bindings/http-protocol-binding.md) requires all CloudEvent metadata to be passed as **HTTP headers**.

AEM prepends all user properties with the prefix `Solace-User-Property-`.  
For example, the CloudEvent property `ce-id` is represented as the HTTP header `Solace-User-Property-ce-id`.

To correlate on metadata, reference the header name including this prefix.

#### Example: CloudEvent HTTP message

```json
{
  "request": {
    "body": { "FlynnLocationID": "34.0522,-118.2437" },
    "headers": {
      "host": "<region>.connectors.camunda.io",
      "authorization": "Basic CaMUnDakZW1v",
      "content-type": "application/json",
      "solace-user-property-ce-specversion": "1.0",
      "solace-user-property-ce-type": "sap.s4.beh.encom.grid.program.v1",
      "solace-user-property-ce-source": "/alan/pager/buzz",
      "solace-user-property-ce-subject": "CLU-2.0",
      "solace-user-property-ce-id": "Argon-T-01",
      "solace-user-property-ce-time": "2018-04-05T03:56:24Z",
      "solace-user-property-ce-datacontenttype": "application/json"
    }
  }
}
```

To correlate on the `ce-id` property, use `request.headers.solace-user-property-ce-id`.

![Mapping to CloudEvent meta data](./img/eventing-correlation-ce-headers.png)

**Tip**
Use backticks to escape dashes in the header name, for example:  
`` request.headers.`solace-user-property-ce-id` ``.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/eventing
