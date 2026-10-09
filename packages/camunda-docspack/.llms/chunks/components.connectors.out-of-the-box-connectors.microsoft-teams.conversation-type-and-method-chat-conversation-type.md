# Microsoft Teams connector — Conversation type and method — Chat conversation type

#### Properties

|    Property     |                                                                     Methods                                                                     | Required |      Type       |                                                                                      Description                                                                                      |
| :-------------: | :---------------------------------------------------------------------------------------------------------------------------------------------: | :------: | :-------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     Chat ID     | Get chat by ID  List chat members  Send message in chat  List messages in chat  Get message in chat  List chat members |   Yes    |     string      |                                                                                Microsoft Teams chat ID                                                                                |
|     Content     |                                                              Send message in chat                                                               |   Yes    |      text       |                                                                           Content that will be sent to chat                                                                           |
|  Content Type   |                                                              Send message in chat                                                               |   Yes    |    dropdown     |                                                                             Content type of body message                                                                              |
|    Chat type    |                                                                Create a new chat                                                                |   Yes    |    dropdown     |                                                 Click **one on one** to create a one-on-one chat or **group** to create a group chat.                                                 |
|      Topic      |                                                                Create a new chat                                                                |    No    |     string      |                                                                                     Topic of chat                                                                                     |
|     Members     |                                                                Create a new chat                                                                |   Yes    | FEEL expression |                                                               See [members property](#members-property) to learn more.                                                                |
|       Top       |                                                              List messages in chat                                                              |    No    |     numbers     |                                                      Controls the number of items per response; maximum allowed top value is 50.                                                      |
|    Order by     |                                                              List messages in chat                                                              |   Yes    |    dropdown     |                                                              Can order by 'lastModifiedDateTime' and 'createdDateTime'.                                                               |
| Expand response |                                                                 Get chat by ID                                                                  |   Yes    |    dropdown     |                                                                                        Choose                                                                                         |
|     Filter      |                                                              List messages in chat                                                              |    No    |     string      | Sets the date range filter for the lastModifiedDateTime and createdDateTime properties. [Learn more about filtering](https://learn.microsoft.com/en-us/graph/filter-query-parameter). |
|   Message ID    |                                                               Get message in chat                                                               |   Yes    |     string      |                                                                            Microsoft Teams chat message ID                                                                            |

##### Expand response

For method **Get chat by ID**, you can get more information in the response by using the dropdown property **Expand response**. You can choose one of the following values:

- select **With chat members**, to get information about chat members.
- select **With last message preview**, to get last message in chat. **Note:** This function doesn't work with [client credentials type authentication](#client-credentials-type-authentication), make sure that you use another authentication type.
- select **Without expand**, to get main information about chat.

##### Members property

The **members** property must contain a list of members:

|     Property      |     Type     | Required                               |
| :---------------: | :----------: | -------------------------------------- |
|      userId       |    string    | Yes, if 'userPrincipalName' is not set |
| userPrincipalName |    string    | Yes, if 'userId' is not set            |
|       roles       | string array | Yes                                    |

```json
[
  {
    "userId": "abc01234-0c7f-012c-9876-&812dsfw2",
    "roles": ["owner"]
  },
  {
    "principalName": "john.dou@mail.com",
    "roles": ["owner"]
  }
]
```

#### Chat methods

|        Method         | Use [protected APIs](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview#teams-apis-that-require-rscs-permissions) | Available for [client credentials type authentication](#client-credentials-type-authentication) |                                            Link to method documentation with required permissions and return value                                             |
| :-------------------: | :-------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|   Create a new chat   |                                                                  false                                                                  |                                              true                                               |          [https://learn.microsoft.com/en-us/graph/api/chat-post](https://learn.microsoft.com/en-us/graph/api/chat-post?view=graph-rest-1.0&tabs=http)          |
|    Get chat by ID     |                                                                  false                                                                  |                                              true                                               |           [https://learn.microsoft.com/en-us/graph/api/chat-get](https://learn.microsoft.com/en-us/graph/api/chat-get?view=graph-rest-1.0&tabs=http)           |
|      List chats       |                                                                  false                                                                  |                                              true                                               |          [https://learn.microsoft.com/en-us/graph/api/chat-list](https://learn.microsoft.com/en-us/graph/api/chat-list?view=graph-rest-1.0&tabs=http)          |
|   List chat members   |                                                                  false                                                                  |                                              false                                              |  [https://learn.microsoft.com/en-us/graph/api/chat-list-members](https://learn.microsoft.com/en-us/graph/api/chat-list-members?view=graph-rest-1.0&tabs=http)  |
| Send message in chat  |                                                                  false                                                                  |                                              false                                              | [https://learn.microsoft.com/en-us/graph/api/chat-post-messages](https://learn.microsoft.com/en-us/graph/api/chat-post-messages?view=graph-rest-1.0&tabs=http) |
|  Get message in chat  |                                                                  false                                                                  |                                              true                                               |    [https://learn.microsoft.com/en-us/graph/api/chatmessage-get](https://learn.microsoft.com/en-us/graph/api/chatmessage-get?view=graph-rest-1.0&tabs=http)    |
| List messages in chat |                                                                  true                                                                   |                                              true                                               | [https://learn.microsoft.com/en-us/graph/api/chat-list-messages](https://learn.microsoft.com/en-us/graph/api/chat-list-messages?view=graph-rest-1.0&tabs=http) |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
