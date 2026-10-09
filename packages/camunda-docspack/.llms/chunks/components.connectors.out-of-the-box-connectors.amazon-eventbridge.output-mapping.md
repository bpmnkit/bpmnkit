# Amazon EventBridge connector — Output mapping

The **Output mapping** section allows you to configure the mapping of the event payload to the process variables.

- Use the **Result variable** to store the event data in a process variable. For example, `myEventPayload`.
- Use the **Result expression** to map specific fields from the event payload into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). For example, given the Amazon EventBridge connector is triggered with an event payload like:

```
{
    "id": "6d3d35b7-5bf2-43ec-9e55-5cfb27ad31b4",
    "detail-type": "MyEvent",
    "source": "custom.application",
    "region": "us-west-2",
    "resources": [],
    "detail": {
        "event": "order_created",
        "customer_id": "12345",
        "order_total": 100.50
    }
}
```

and you would like to extract the `customer_id` and `order_total` as process variables `customerId` and `orderTotal`, the **Result Expression** might look like this:

```
= {
customerId: request.body.detail.customer_id,
orderTotal: request.body.detail.order_total
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
