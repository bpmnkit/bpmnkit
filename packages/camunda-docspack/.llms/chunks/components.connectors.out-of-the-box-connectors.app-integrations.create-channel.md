# App Integrations connector — Create channel

Create a channel in Microsoft Teams or Slack. Select the platform first.

### teams

| Property     | Type     | Required | Description                                                                                         | Example                |
| :----------- | :------- | :------- | :-------------------------------------------------------------------------------------------------- | :--------------------- |
| Channel name | String   | Yes      | Display name for the new channel. Maximum 50 characters.                                            | `Releases`             |
| Team ID      | String   | Yes      | The team's group ID, or a full Teams URL. The `groupId` query parameter is extracted automatically. | `<groupId>`            |
| Channel type | Dropdown | Yes      | Membership type. Only **Standard** is available.                                                    | `Standard`             |
| Description  | String   | No       | Channel description.                                                                                | `Release coordination` |

**Note**
Only standard channels are supported. Private and shared channels are not yet available, and a request for either is rejected.

### slack

| Property        | Type    | Required | Description                                                                                                                  | Example                |
| :-------------- | :------ | :------- | :--------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| Channel name    | String  | Yes      | Lowercase letters, digits, hyphens, and underscores only. Maximum 80 characters.                                             | `releases`             |
| Workspace ID    | String  | No       | Slack workspace (team) ID. Leave empty for the normal case.                                                                  | `T0123`                |
| Private channel | Boolean | No       | Create the channel as private rather than public. The connector's Microsoft Teams operation supports only standard channels. | `false`                |
| Description     | String  | No       | Applied after creation. A failure here is logged and does not fail the operation.                                            | `Release coordination` |

**Note**
The backend holds one bot token and no installation store, so a channel can only be created in that token's workspace. A supplied **Workspace ID** is checked against it and rejected with HTTP `400` when it differs. It can never route the creation to a different workspace. Leave it empty in the normal case.

### Response

```json
{ "channelId": "19:new-channel@thread.tacv2" }
```

The response has the same `channelId` field on both platforms. Read the new channel with `= response.channelId`. You can pass it straight into a **Send message** task as the channel target.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
