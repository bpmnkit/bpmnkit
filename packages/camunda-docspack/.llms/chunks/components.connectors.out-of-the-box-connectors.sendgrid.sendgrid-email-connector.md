# SendGrid connector — SendGrid Email connector

#### Create a SendGrid Email connector Task

---
---

You can apply a connector to a task or event via the append menu. For example:

- **From the canvas**: Select an element and click the **Change element** icon to change an existing element, or use the append feature to add a new element to the diagram.
- **From the properties panel**: Navigate to the **Template** section and click **Select**.
- **From the side palette**: Click the **Create element** icon.

In each of these menus, you can search by connector name or by the operation you want to perform, such as `upload object` or `send email`. Connectors that provide several operations list them as separate entries, and selecting an operation applies the connector with that operation preselected.

After you have applied a connector to your element, follow the configuration steps or see [using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

#### Make your SendGrid Email connector executable

To make the **SendGrid Email connector** executable, you need to fill out all the mandatory fields highlighted in red in the properties panel on the right side of the screen:

1. Set **SendGrid API Key** to `{{secrets.SEND_GRID_API_KEY}}`.
2. Set **Sender Name** to `Jane Doe` (or the [sender identity](#create-a-sender-identity) you configured above).
3. Set **Sender Email** to `jane-doe@camunda.com` (or the [sender identity](#create-a-sender-identity) you configured above).
4. Set **Receiver Name** to `Your Name`.
5. Set **Receiver Email** to `Your email address`.
6. Set **Email Content Subject**.
7. Leave **Content Type** to **text/plain** (or alternatively to **text/html** if you intend to provide an HTML body to your email).
8. Provide a text (or HTML) **Body** for your email.
9. **Attachments** is a list of documents to include as part of your **new email**.
   - Each attachment uses a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL. Use the **Single/Multiple** toggle to provide one document or a FEEL array of documents.
   - To use a **Camunda document**, upload it first — [using the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) for example — and assign the result to a variable in **Start Process instance** so you can reference it in the **Attachments** field.

**Note**
Starting from version 8.7.0, the SendGrid connector provides attachment support. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sendgrid
