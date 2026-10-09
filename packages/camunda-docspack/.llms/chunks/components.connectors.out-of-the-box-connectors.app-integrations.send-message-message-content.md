# App Integrations connector — Send message — Message content

**Message** is plain text and always available. It is optional. Leave it empty to send only the additional content, or fill both to send text and a card in one message.

**Additional content** offers different formats depending on the recipient, because each platform accepts different payloads:

| Recipient       | Additional content options  |
| :-------------- | :-------------------------- |
| Camunda         | None · Form                 |
| Microsoft Teams | None · Adaptive card · Form |
| Slack           | None · Block Kit · Form     |

You can select at most one, so a card and a form are mutually exclusive. You must provide a message, additional content, or both. An empty message with **None** is rejected before any call is made.

| Additional content | Property         | Type | Required | Description                             |
| :----------------- | :--------------- | :--- | :------- | :-------------------------------------- |
| Adaptive card      | Adaptive card    | Text | Yes      | Adaptive Card as JSON.                  |
| Block Kit          | Block Kit blocks | Text | Yes      | Slack Block Kit `blocks` array as JSON. |

Both fields accept pasted JSON as well as a FEEL expression referencing a card built earlier in the process, such as `= approvalCard`. A JSON literal is valid FEEL, so pasting works without further quoting.

When **Block Kit blocks** is combined with a **Message**, the message text is posted as a leading section block above the supplied blocks.

When additional content is **Form**, the connector renders a linked Camunda form: an Adaptive Card on Microsoft Teams, or Block Kit on Slack. Select the form and its binding in the properties panel:

| Property     | Type     | Required | Description                                                     |
| :----------- | :------- | :------- | :-------------------------------------------------------------- |
| Form binding | Dropdown | Yes      | `Latest`, `Deployment`, or `Version tag`. Defaults to `Latest`. |
| Form ID      | String   | Yes      | ID of the Camunda form to render alongside the message.         |
| Version tag  | String   | Yes\*    | The version tag to bind to.                                     |

\* Required when **Form binding** is **Version tag**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
