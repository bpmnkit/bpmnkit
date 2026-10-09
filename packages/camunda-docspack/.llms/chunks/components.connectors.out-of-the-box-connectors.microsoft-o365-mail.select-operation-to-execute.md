# Microsoft 365 connector — Select operation to execute

Select the desired operation from the **Operations** section.

### Get user folders

Related Microsoft Graph API: [user: list mailFolders](https://learn.microsoft.com/en-us/graph/api/user-list-mailfolders)

1. Enter user's email or system UUID to fetch all their folders in the **User ID** field.
2. You can also pass [OData parameters](https://learn.microsoft.com/en-us/graph/query-parameters?tabs=http) in the **Query parameters** field.

For example, if you wish to pass an OData `$top` URL parameter, execute the following:

```json
{
  "$top": 10
}
```

### Create mail folder for a user

Related Microsoft Graph API: [user: create mailFolder](https://learn.microsoft.com/en-us/graph/api/user-post-mailfolders)

1. Enter user's email or system UUID to fetch all their folders in the **User ID** field.
2. In the **Request** section, enter a **Folder display name** string value.

### Get user messages

Related Microsoft Graph API: [user: list messages](https://learn.microsoft.com/en-us/graph/api/user-list-messages)

1. Enter user's email or system UUID to fetch all their folders in the **User ID** field.
2. You can also pass [OData parameters](https://learn.microsoft.com/en-us/graph/query-parameters?tabs=http) in the **Query parameters** field.

For example, if you wish to pass an OData `$top` URL parameter, execute the following:

```json
{
  "$top": 10
}
```

### Send mail on behalf of a user

Related Microsoft Graph API: [user: sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail)

1. Enter user's email or system UUID to fetch all their folders in the **User ID** field.
2. In the **Request** section, enter a **Subject** string value.
3. Select **Body content type** from the dropdown.
4. Enter desired content in the field **Body content**.
5. Pass an array of emails into the **To recipients** field, for example `["myuser1@mycompany.com", "myuser2@mycompany.com"]`.
6. (Optional) Pass an array of emails into the **CC recipients** field, for example `["myuser3@mycompany.com", "myuser4@mycompany.com"]`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail
