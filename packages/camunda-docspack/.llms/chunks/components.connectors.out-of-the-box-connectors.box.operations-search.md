# Box connector — Operations — Search

Searches the items stored in the Box account.

| Property              | Type   | Required | Example       |
| --------------------- | ------ | -------- | ------------- |
| Search query          | String | Yes      | "inci"        |
| Seach sort column     | String | No       | `modified_at` |
| Search sort direction | String | No       | `DESC`        |
| Search offset         | String | No       | `0`, `10`     |
| Search limit          | String | No       | `50`          |

Example search result with a single item:

```json
{
  "items": [
    { "id": "1733978444906", "name": "incident-wrapped.png", "type": "file" }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
