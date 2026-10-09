# Integrate a built-in connector — Add a connector

At the beginning of the process, a receipt is ready and uploaded for review. The next task is to notify the manager of the uploaded receipt.

To accomplish this, you'll use SendGrid to send an email:

1. With the **submit-expense** diagram open, make sure you're in [**Implement** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process).
2. Click the **Notify manager of receipt** task.
3. Click **Change element**.
4. Search for **Send Email with SendGrid**. If you're using Self-Managed, you may need to download it from the connector marketplace. You can search for the operation you want to perform, such as `send email`, instead of the connector name.
5. Open the **Details** panel on the right side of the modeling interface.
6. Under **Properties**, configure the following sections:
   - **Authentication:** [Full Access API Key](https://www.twilio.com/docs/sendgrid/ui/account-and-settings/api-keys#creating-an-api-key)
   - **Sender:** Name and email address. Make sure [this email is verified by SendGrid](https://www.twilio.com/docs/sendgrid/ui/sending-email/sender-verification).
   - **Receiver:** Name and email address
   - **Compose email:** Email contents

The connector is ready to use.

**Note**
Camunda offers a variety of available connectors. For example, utilize cloud connectors to communicate with cloud-native applications and conform to REST, GraphQL, or SOAP protocols. Or, employ service connectors to integrate with technology enablers like RPA, AI or IOT services. Learn more about our [available connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) to find out which may best suit your business needs.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/configuring-out-of-the-box-connector
