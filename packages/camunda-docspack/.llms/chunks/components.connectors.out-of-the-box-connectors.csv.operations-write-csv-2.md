# CSV connector — Operations — Write CSV (2)

```json
[
  ["Wireless Mouse", "25", "29.99"],
  ["Office Chair", "8", "149.50"],
  ["USB Cable", "100", "12.99"],
  ["Monitor Stand", "15", "45.00"],
  ["Desk Lamp", "32", "24.95"]
]
```

#### Example output for a CSV returned as a string

```json
{
  "content": "Wireless Mouse,25,29.99\r\nOffice Chair,8,149.50\r\nUSB Cable,100,12.99\r\nMonitor Stand,15,45.00\r\nDesk Lamp,32,24.95\r\n"
}
```

#### Example output for a CSV stored in a document

```json
{
  "document": {
    "storeId": "in-memory",
    "documentId": "8b54b413-b847-4650-b445-de963d5c506d",
    "contentHash": "ed0f7ad835669698a108a32b2a99e89e4f5aea84127fde68df4248b11197b0e5",
    "metadata": {
      "contentType": "text/csv",
      "size": 114,
      "fileName": "8b54b413-b847-4650-b445-de963d5c506d"
    },
    "camunda.document.type": "camunda"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/csv
