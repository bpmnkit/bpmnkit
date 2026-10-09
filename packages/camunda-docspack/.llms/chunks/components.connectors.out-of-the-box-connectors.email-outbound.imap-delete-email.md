# Email connector — IMAP — Delete Email

Delete an email from a specified folder, using the email's unique `messageId`.

#### Parameters

| Parameter   | Description                                                                                                                                                                                                                                    |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MessageId` | The identifier of the email message to delete.                                                                                                                                                                                                 |
| `Folder`    | (Optional) Specifies the folder from which the email should be deleted. If this parameter is not supplied, the default folder is assumed to be `INBOX`. For subfolders, use `.` or `/` separated path (ex: `inside/folder` or `inside.folder`) |

#### Response Structure

The task provides a JSON object in the response, indicating the outcome of the deletion request:

- `deleted`: A boolean value that signifies whether the email was successfully deleted (true) or not (false).
- `messageId`: Reiterates the `messageId` of the email that was targeted for deletion.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following is an example of the JSON response confirming successful email deletion:

```json
{
  "deleted": true,
  "messageId": "MessageId"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
