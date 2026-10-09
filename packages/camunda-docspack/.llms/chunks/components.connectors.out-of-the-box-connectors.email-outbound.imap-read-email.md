# Email connector — IMAP — Read Email

Retrieve an email's details based on the specified `messageId`.

#### Parameters

| Parameter   | Description                                                                                                                                                                                                      |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MessageId` | The unique identifier of the email that must be read.                                                                                                                                                            |
| `Folder`    | (Optional) Specifies the folder from which the email should be retrieved. If not provided, the default folder is `INBOX`. For subfolders, use `.` or `/` separated path (ex: `inside/folder` or `inside.folder`) |

#### Response Structure

The task returns a JSON object containing detailed information about the email:

- `messageId`: The unique identifier of the email message.
- `fromAddress`: The email addresses of the sender.
- `headers` : A list of the email headers.
- `subject`: The subject line of the email.
- `size`: The size of the email (in bytes).
- `plainTextBody`: The plain text version of the email content.
- `htmlBody`: The HTML version of the email content, if it exists.
- `attachments`: A list of all the email's attachments, provided as a document reference.
- `receivedDateTime`: The date and time the email was received.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following JSON structure shows an expected response after a successful email retrieval:

```json
{
  "messageId": "MessageId",
  "fromAddress": "example@camunda.com",
  "subject": "Example Subject",
  "size": 99865,
  "plainTextBody": "Any text content",
  "htmlBody": "<html>Any Html Content</html>",
  "headers": [
    {
      "key": "header1",
      "value": "example"
    },
    {
      "key": "header2",
      "value": "test"
    }
  ],
  "attachments": [
    {
      "storeId": "in-memory",
      "documentId": "20f1fd6a-d8ea-403b-813c-e281c1193495",
      "metadata": {
        "contentType": "image/webp; name=305a4816-b3df-4724-acd3-010478a54add.webp",
        "size": 311032,
        "fileName": "305a4816-b3df-4724-acd3-010478a54add.webp"
      },
      "documentType": "camunda"
    }
  ],
  "receivedDateTime": "2024-08-19T06:54:28Z"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
