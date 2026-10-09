# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Output mapping

The **Microsoft 365 Email Inbound connector** returns the consumed email message with the following structure:

```json
{
  "id": "AAMkAGVmMDEzM...",
  "conversationId": "AAQkAGVmMDEzM...",
  "subject": "Invoice #12345",
  "body": "Please find attached...",
  "bodyContentType": "text/plain",
  "sender": {
    "name": "John Doe",
    "address": "john.doe@example.com"
  },
  "recipients": [
    {
      "name": "Jane Smith",
      "address": "jane.smith@company.com"
    }
  ],
  "cc": [],
  "bcc": [],
  "receivedDateTime": "2024-01-15T14:30:00Z",
  "attachments": [
    {
      "id": "AAMkAGVmMDEzM...",
      "name": "invoice.pdf",
      "contentType": "application/pdf",
      "size": 125000
    }
  ]
}
```

You can use an output mapping to map the response:

1. Use **Result variable** to store the response in a process variable. For example, `emailMessage`.
2. Use **Result expression** to map fields from the response into process variables. For example:

```feel
= {
  "emailSubject": response.subject,
  "senderEmail": response.sender.address,
  "receivedAt": response.receivedDateTime,
  "hasAttachments": count(response.attachments) > 0
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
