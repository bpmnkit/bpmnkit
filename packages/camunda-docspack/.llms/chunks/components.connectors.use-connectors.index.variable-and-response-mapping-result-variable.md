# How to use connectors — Variable and response mapping — Result variable

This field declares a singular process variable designated for the export of responses from a connector call.
The resulting process variable can be subsequently utilized within the ongoing process.

#### Example

If you set `result` inside the **Result Variable** field of the REST outbound connector, this variable is available:

```json
{
  "result": {
    "status": 200,
    "headers": {
      "date": "Thu, 03 Apr 2025 07:05:19 GMT",
      "server": "nginx",
      "content-type": "text/html; charset=UTF-8"
    },
    "body": {
      "orderNumber": "1234",
      "date": "2025-04-01",
      "customerId": "567",
      "address": {
        "streetAddress": "1234 Elm Street",
        "city": "Paris",
        "state": "CA",
        "postalCode": "90210",
        "country": "USA"
      }
    },
    "reason": "OK",
    "document": null
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
