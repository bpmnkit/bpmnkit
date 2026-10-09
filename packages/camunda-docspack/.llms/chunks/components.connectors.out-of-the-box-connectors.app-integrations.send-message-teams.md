# App Integrations connector — Send message — teams

Select a **Teams target**, then fill the field it reveals.

| Teams target | Property     | Required | Description                                                                                   | Example                                     |
| :----------- | :----------- | :------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------ |
| Channel      | Channel ID   | Yes      | The Microsoft Teams channel to post into.                                                     | `19:xxx@thread.tacv2`                       |
| User         | User ID      | Yes      | Microsoft Entra object ID of the recipient. They must have connected the Camunda app.         | `6b1e0f9a-1f3d-4a2b-9d0e-4c1b2a3d4e5f`      |
| Conversation | Conversation | Yes      | The `conversation` value returned by a previous send. The message is posted as a reply in it. | `19:abc@thread.tacv2;messageid=17123456789` |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
