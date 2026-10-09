# Email connector — POP3 — Delete Email

Delete (remove) an email from the server, using the specific `messageId` assigned to the email message.

#### Parameters

| Parameter   | Description                                    |
| :---------- | :--------------------------------------------- |
| `MessageId` | The identifier of the email message to delete. |

#### Response Structure

After the deletion task is performed, a JSON object is returned to confirm the action:

- `deleted`: A boolean value that indicates whether the deletion was successful (true) or not (false).
- `messageId`: The identifier of the email message that was attempted to be deleted.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following JSON response shows the result of a successful deletion request:

```json
{
  "deleted": true,
  "messageId": "MessageId"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
