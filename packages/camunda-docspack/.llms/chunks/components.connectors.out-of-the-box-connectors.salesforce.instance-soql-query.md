# Salesforce connector — Instance — SOQL Query

The **SOQL Query** only requires the query itself as input. A query is useful for receiving data based on a structured query language. Take a closer look at some available [examples](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_select_examples.htm).

The response body looks like the following:

```json
{
  "totalSize": 1,
  "done": true,
  "records": [
    {
      "attributes": {
        "type": "<object>",
        "url": "/services/data/<API version>/sobjects/<object>/<object id>"
      },
      "<queried field name>": "<field value>",
      "...": "..."
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/salesforce
