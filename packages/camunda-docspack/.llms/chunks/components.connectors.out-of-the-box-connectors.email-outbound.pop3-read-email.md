# Email connector — POP3 — Read Email

Retrieve the contents of an email, using the unique `messageId` associated with the email message.

**Danger**
Reading an email using POP3 protocol will delete the email

#### Parameters

| Parameter   | Description                                                                                                 |
| :---------- | :---------------------------------------------------------------------------------------------------------- |
| `MessageId` | The identifier of the email message you wish to read. Provide this to locate and return the specific email. |

#### Response Structure

The task returns a JSON object containing detailed information about the email:

- `messageId`: The unique identifier corresponding to the email message.
- `fromAddress`: The email addresses of the sender.
- `headers` : A list containing the email's headers
- `subject`: The subject line of the email.
- `size`: The size of the email in bytes.
- `plainTextBody`: The plain text version of the email's content.
- `htmlBody`: The HTML version of the email's content (if content exists).
- `attachments`: A list of all the email's attachments, provided as a document reference.
- `receivedDateTime`: The email's reception datetime

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

**Note**
The outbound email connector supports sending documents as attachments. Each attachment uses a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL.

Use the **Single/Multiple** toggle to provide one document or a FEEL array of documents (for example, `=[document1, document2]`).

See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

#### Example Response

Below is an example of the JSON response returned when a specific email is read:

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
