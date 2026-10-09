# Manage applications — Application types

To align with the [OAuth 2.0 standard](https://oauth.net/2/client-types/), Camunda distinguishes between _confidental_ and _public_ clients. Applications are also categorized by usage pattern, using the _M2M_ application type in Identity, for systems to communicate using _confidental_ clients without direct user interaction.

- Confidential
- Machine-to-machine (M2M)
- Public

The application type is selected when you [create an application](#add-an-application), based on its ability to securely store and use secrets, as well as the mode of authentication it uses.

| Application type | Secret | User login flow | M2M authentication |
| :--------------- | :----- | :-------------- | :----------------- |
| Confidential     | Yes    | Yes             | Yes                |
| M2M              | Yes    | No              | Yes                |
| Public           | No     | Yes             | No                 |

**Info**

- To learn more about OAuth client types, refer to [OAuth 2.0 Client Types](https://oauth.net/2/client-types/),
- To learn more about confidential and public applications, refer to [confidential and public applications](https://auth0.com/docs/get-started/applications/confidential-and-public-applications).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/applications
