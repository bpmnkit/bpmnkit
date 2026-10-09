# Email connector — SMTP — Send Email

Allow users to send an email from the connected email account.

#### Parameters

| Parameter            | Description                                                                                                                                                                                                                                                                                   |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `From`               | Specify the sender's email address(es). This can be a single email address (for example, 'example@camunda.com'), a comma-separated list of addresses, or a Friendly Enough Expression Language (FEEL) expression returning a list of email addresses (for example, =["example@camunda.com"]). |
| `To`                 | Defines the email recipient(s). Similar to the `From` parameter, this can be a single email address, a comma-separated list, or a FEEL expression (for example, =["example@camunda.com"]).                                                                                                    |
| `Cc`                 | (Optional) Specify the email address(es) to include in the **Carbon Copy (CC)** field. The format is the same as the **From** and **To** fields, and can include a single address, a list, or a FEEL expression.                                                                              |
| `Bcc`                | (Optional) Specify the email address(es) to include in the **Blind Carbon Copy (BCC)** field. It follows the same format as the **CC** field and ensures that BCC recipients are not visible to other recipients.                                                                             |
| `Headers`            | Feel expression containing all the desired headers to be added to the email's headers. cf. `{ "customHeaders" : "new header value" }`                                                                                                                                                         |
| `Subject`            | The email subject line.                                                                                                                                                                                                                                                                       |
| `Content Type`       | The content type of the email.                                                                                                                                                                                                                                                                |
| `Email Text Content` | The text content of the email. This must only be provided if the `Content Type` is `PLAIN` or `HTML & PlainText`.                                                                                                                                                                             |
| `Html Text Content`  | The HTML content of the email. This must only be provided if the `Content Type` is `HTML` or `HTML & PlainText`.                                                                                                                                                                              |
| `Attachment`         | The document(s) to attach. Select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources) (Camunda document, inline content, or external document); use the **Single/Multiple** toggle for one document or a FEEL array of documents.         |

**Info**
To learn more about Friendly Enough Expression Language (FEEL) expression,
see [what is FEEL?](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

#### Response Structure

Upon successfully sending the email, the following JSON response is returned:

- `subject`: Echoes back the subject of the sent email.
- `sent`: A boolean value indicating the success status of the email being sent (true for success, false for failure).
- `messageId`: A unique identifier for the email message.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following is an example of a successful send email operation:

```json
{
  "subject": "Example Subject",
  "sent": true,
  "messageId": "<messageId>"
}
```

In this response:

- `sent: true` confirms that the email with the specified subject "Example Subject" was successfully sent.
- `sent: false` indicates the email failed to send.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
