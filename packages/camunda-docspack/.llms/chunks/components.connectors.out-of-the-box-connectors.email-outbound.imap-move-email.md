# Email connector — IMAP — Move Email

Enable users to transfer an email from one folder to another, streamlining inbox organization.

#### Parameters

| Parameter       | Description                                                                                                                                                                                                                                                     |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MessageId`     | The identifier of the email that needs to be moved.                                                                                                                                                                                                             |
| `Source folder` | (Optional) The folder from which the email will be moved. If not specified, the default is INBOX. For subfolders, use `.` or `/` separated path (ex: `inside/folder` or `inside.folder`)                                                                        |
| `Target folder` | The destination folder where the email is placed. To specify a new folder or a nested hierarchy, use `.` or `/` separated path (for example, 'Archive/test' or 'Projects.2023.January'). The system automatically creates any non-existent folders in the path. |

#### Response Structure

Upon successful completion of the move operation, the response contains a JSON object with the following details:

- `messageId`: The `messageId` of the email that was moved.
- `from`: The source folder from which the email was moved.
- `to`: The target folder to which the email has been moved.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The example below shows the expected JSON response after an email has been successfully moved:

```json
{
  "messageId": "<VE1P191MB1101730EEA31B2FEAB320143919A2@VE1P191MB1101.EURP191.PROD.OUTLOOK.COM>",
  "from": "INBOX",
  "to": "TEST"
}
```

---
---

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
