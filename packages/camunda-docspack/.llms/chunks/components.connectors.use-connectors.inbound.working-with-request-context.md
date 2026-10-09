# Use an inbound connector — Working with request context

You can access request context in the **Activation condition**, **Result expression**, and **Response body expression**.

Let's consider the following cURL query: `curl -X POST -H "Content-Type: application/json" -H "MyHeader: myValue" -d '{"status": "OK", "id": 123}' "http://<YOUR_HOST>/inbound/myWebhook?param1=val1"`.

A webhook connector context data will arrive as follows:

```json
{
  "request": {
    "body": {
      "status": "OK",
      "id": 123
    },
    "headers": {
      "host": "YOUR_HOST",
      "user-agent": "curl/7.88.1",
      "accept": "*/*",
      "content-type": "application/json",
      "myheader": "myValue",
      "content-length": "27"
    },
    "params": {
      "param1": "val1"
    }
  },
  "connectorData": {}
}
```

This means in scope of the fields **Activation condition**, **Result expression**, and **Response body expression**,
you can use not only `request.body.<property>` but also access headers via `request.headers.myheader` or params `request.params.param1`.

There is also a connector-specific special case of `connectorData` that is usually empty and used in rare cases, when body has to be crafted in a special way, but a connectors user might still want access context data.

See a list of [available inbound connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) and their respective specific configuration instructions.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
