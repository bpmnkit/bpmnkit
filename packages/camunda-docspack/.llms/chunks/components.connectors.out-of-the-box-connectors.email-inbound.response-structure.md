# Email connector — Response Structure

The task returns a JSON object containing detailed information about the email:

- `messageId`: The unique identifier of the email message.
- `fromAddress`: The email addresses of the sender.
- `headers` : A list of the email headers.
- `subject`: The subject line of the email.
- `size`: The size of the email (in bytes).
- `plainTextBody`: The plain text version of the email content.
- `htmlBody`: The HTML version of the email content, if it exists.
- `attachments` A list of document reference
- `receivedDateTime`: The date and time the email was received.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following example JSON response shows the data structure produced when an email triggers the creation of a process
instance:

```json
{
  "messageId": "messageId",
  "fromAddress": "example@camunda.com",
  "subject": "Urgent Test",
  "size": 65646,
  "plainTextBody": "Hey how are you?\r\n",
  "htmlBody": "<html>Hello</html>",
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

This response includes essential email details such as the `messageId`, sender addresses, subject, size, and the content
of the email both in plain text and HTML format. This information can be used by the process for various workflows, such
as prioritizing tasks, content analysis, and automated responses.

---
---

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-inbound
