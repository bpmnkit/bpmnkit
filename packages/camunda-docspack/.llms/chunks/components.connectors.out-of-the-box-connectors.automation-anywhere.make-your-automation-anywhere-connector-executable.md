# Automation Anywhere connector — Make your Automation Anywhere connector executable

To work with Automation Anywhere, choose the required operation type in the **Operation** section and authentication type in the **Authentication** section and complete the mandatory fields highlighted in red in the connector properties panel on the right side of the screen.

**Note**
All the mandatory and non-mandatory fields depending on the authentication and operation selections you choose are covered in the upcoming sections.


## Authentication

You can choose among the available **Automation Anywhere connector** authentication types according to your authentication requirements.

**Note**
We advise you to keep your authentications and secrets data safe and avoid exposing it in the BPMN XML file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `AUTOMATION_ANYWHERE_PASSWORD`) so you can reference it later in the connector.

### _Authenticate (username and password)_ authentication

Select the **Automation Anywhere connector** and fill out the following properties under the **Authentication** section:

1. Select **Authenticate (username and password)** in the **Authentication** section.
2. Set **Password** to `Password` to the secret you created (i.e. `{{secrets.AUTOMATION_ANYWHERE_PASSWORD}}`).
3. Set **Username** to `Username` to the secret you created (i.e. `{{secrets.AUTOMATION_ANYWHERE_UESRNAME}}`).
4. Select needed **Multiple login** type. If this value is set to `true`, you will be allowed multiple API sessions. For more information on multi-login, refer to [multi-login user](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/enterprise-cloud/topics/control-room/administration/users/cloud-multi-login-user.html).

### _Authenticate (username and API key)_ authentication

Select the **Automation Anywhere connector** and fill out the following properties under the **Authentication** section:

1. Select **Authenticate (username and API key)** in the **Authentication** section.
2. Set **Password** to `Password` to the secret you created (i.e. `{{secrets.AUTOMATION_ANYWHERE_PASSWORD}}`).
3. Set **API key** as `API key` to the secret you created (i.e. `{{secrets.AUTOMATION_ANYWHERE_API_KEY}}`). The API-Key is a 40-character string generated in the Control Room. Refer to [create and assign API key generation role documentation](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/enterprise-cloud/topics/control-room/administration/roles/cloud-control-room-apikey-role.html) to learn more.

### _Authentication (refresh) token_ authentication

Select the **Automation Anywhere connector** and fill out the following properties under the **Authentication** section:

1. Select **Authentication (refresh) token** in the **Authentication** section.
2. Set **Token** to `Token` to the secret you created (i.e. `{{secrets.AUTOMATION_ANYWHERE_TOKEN}}`). It can be an authentication or refresh token. Refer to [authentication API documentation](https://docs.automationanywhere.com/bundle/enterprise-v11.3/page/enterprise/topics/control-room/control-room-api/api-authentication.html) to learn how to generate an authentication token or observe the [refresh token API documentation](https://docs.automationanywhere.com/bundle/enterprise-v11.3/page/enterprise/topics/control-room/control-room-api/refresh-authentication-token.html) to learn how to generate a refresh token.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/automation-anywhere
