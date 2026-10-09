# App Integrations connector — Send message — camunda

Address people by their Camunda identity, and let app integrations resolve which platforms to deliver to. At least one of the three fields is required.

| Property         | Type   | Required | Description                     | Example              |
| :--------------- | :----- | :------- | :------------------------------ | :------------------- |
| Assignee email   | String | No\*     | Email address of the recipient. | `= assigneeEmail`    |
| Candidate users  | List   | No\*     | Usernames to notify.            | `= ["alice", "bob"]` |
| Candidate groups | List   | No\*     | Group names to notify.          | `= ["approvers"]`    |

\* At least one of the three must be provided.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
