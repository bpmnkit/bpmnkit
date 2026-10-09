# How to use connectors — Variable and response mapping — Result expression

This field facilitates the mapping of a connector response into multiple process variables,
providing further flexibility of the variable utilization within the ongoing process.
Additionally, the extracted values can be transformed with [FEEL expressions](https://docs.camunda.io/docs/next/components/concepts/expressions).

To ensure process isolation, note that connectors do not have access to process variables.

**Note**
While using this field, a process variable with the name `response` is reserved.
It should only be used when a connector returns atomic values like a string or a number.

#### Example

If you set `{ "bodyReceived": body }` inside the **Result Expression** field of the REST outbound connector, this variable
is available:

```json
{
  "bodyReceived": {
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
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
