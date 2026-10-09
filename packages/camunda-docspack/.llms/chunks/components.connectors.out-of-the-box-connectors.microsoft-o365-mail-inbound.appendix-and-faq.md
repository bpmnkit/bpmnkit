# Microsoft 365 email inbound connector — Appendix and FAQ

### What happens if email processing fails?

If the connector fails to process an email (for example, due to Zeebe being unavailable), the email remains unprocessed and the connector will attempt to process it again on the next polling cycle.

If you configured a processing operation (mark as read, delete, move), the operation will only be executed after successful process correlation.

### Can I monitor multiple folders?

To monitor multiple folders, create separate connector instances with different folder configurations. You can reuse the same authentication credentials across multiple instances.

### How are email attachments handled?

Email attachments are automatically fetched and stored using [Camunda document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started). The attachment metadata is included in the connector output (see [Output Mapping](#output-mapping)), and each attachment is available as a document reference that you can use in subsequent process steps.

For example, to pass an attachment to another connector or download it, use the document reference from the `attachments` array:

```feel
= {
  "firstAttachment": response.attachments[1],
  "allAttachments": response.attachments
}
```

Learn more about working with documents in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

### What lifecycle does the Microsoft 365 Email Inbound connector have?

The Microsoft 365 Email Inbound connector is a long-running connector that is activated when the process is deployed, and deactivated when the process is undeployed or overwritten by a new version.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
