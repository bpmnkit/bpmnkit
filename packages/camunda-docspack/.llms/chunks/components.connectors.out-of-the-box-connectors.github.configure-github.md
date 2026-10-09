# GitHub connector — Configure GitHub

1. Ensure you have administrator rights for the repository where you wish to enable a webhook.
2. Open a repository in your web browser and navigate to the **Settings** page.
3. Click **Webhooks > Add webhook**.
4. Fill out the required fields:
   1. **Payload URL** - URL of your webhook.
   2. **Content type** - Select `application/json`.
   3. **Secret** - Shared secret between GitHub and your BPMN diagram.
5. Confirm by clicking **Add webhook**.

Refer to the [GitHub documentation](https://docs.github.com/en/rest/webhooks) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
