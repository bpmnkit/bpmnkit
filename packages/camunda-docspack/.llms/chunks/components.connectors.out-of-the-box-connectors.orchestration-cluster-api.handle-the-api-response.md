# Camunda Orchestration Cluster API connector — Handle the API response

You can use an output mapping to map the response:

1. Use **Result variable** to store the response in a process variable.
2. Use **Result expression** to map fields from the response into process variables. By default, this connector sets the result expression to `={orchestrationClusterResponse: response.body}`.

Response example for a **Search** operation on process instances:

```json
{
  "status": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "items": [
      {
        "processInstanceKey": "2251799814052469",
        "processDefinitionId": "order-process",
        "processDefinitionKey": "2251799814052467",
        "processDefinitionVersion": 1,
        "startDate": "2023-03-21T08:25:04.499+0000",
        "endDate": "2023-03-21T08:25:12.093+0000",
        "state": "COMPLETED"
      },
      {
        "processInstanceKey": "2251799814052613",
        "processDefinitionId": "order-process",
        "processDefinitionKey": "2251799814052610",
        "processDefinitionVersion": 2,
        "startDate": "2023-03-21T08:27:49.784+0000",
        "endDate": "2023-03-21T08:27:58.838+0000",
        "state": "COMPLETED"
      }
    ],
    "page": {
      "totalItems": 55,
      "startCursor": "jfenj8vhekgj98uzfafhu7",
      "endCursor": "negbkjeh84tzh4gk0kwegj"
    }
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
