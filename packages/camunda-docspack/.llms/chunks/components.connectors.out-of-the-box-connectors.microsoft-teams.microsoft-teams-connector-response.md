# Microsoft Teams connector — Microsoft Teams connector response

The **Microsoft Teams connector** returns the Microsoft Graph API response in `result` wrapper:

```json
{
  "result": {
    "chatType": "ONE_ON_ONE",
    "createdDateTime": {
      "dateTime": {
        "date": {
          "year": 2022,
          "month": 11,
          "day": 29
        },
        "time": {
          "hour": 18,
          "minute": 10,
          "second": 33,
          "nano": 361000000
        }
      },
      "offset": {
        "totalSeconds": 0
      }
    },
    "lastUpdatedDateTime": {
      "dateTime": {
        "date": {
          "year": 2022,
          "month": 11,
          "day": 29
        },
        "time": {
          "hour": 18,
          "minute": 10,
          "second": 33,
          "nano": 361000000
        }
      },
      "offset": {
        "totalSeconds": 0
      }
    },
    "tenantId": "0000000-0000-0000-0000-000000000",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3Aefb08ac3-0000f-0000-0000-example-chat-id_fe35bf61-0000-0000-0000-ddc97d8903d4%40unq.gbl.spaces/0?tenantId=00000-0000-0000-0000-00000000",
    "id": "19%3Aefb08ac3-0000f-0000-0000-example-chat-id_fe35bf61-0000-0000-0000-ddc97d8903d4%40unq.gbl.spaces"
  }
}
```

See [channel resource type](https://learn.microsoft.com/graph/api/resources/channel?view=graph-rest-1.0) to find the response for the required method for a channel conversation type, or see [chat resource type](https://learn.microsoft.com/graph/api/resources/chat?view=graph-rest-1.0) to find the response for the required method for a chat conversation type.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

```
= {
  "chatId": result.id,
  "tenantId": result.tenantId
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
