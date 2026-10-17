# GraphQL connector — Make your GraphQL connector executable

To make the **GraphQL connector** executable, fill out the mandatory fields highlighted in red in the properties panel on the right side of the screen.

**Note**
All the mandatory and non-mandatory fields are covered in the upcoming sections. Depending on the authentication selection you make, more fields might be required; this is covered in the next section.

### Authentication

You can choose among the available authentication types according to your authentication requirements using the **Authentication** section.

### None

Click **None** in the **Authentication** section. No extra authentication configuration is required.

### Basic

#### Create a new connector secret

We advise you to keep your **Password** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `GRAPHQL_PASSWORD`) so you can reference it later in the connector.

### Configure Basic Authentication

Select the **GraphQL connector** and fill out the following properties under the **Authentication** section:

1. Click **Basic** in the **Authentication** section.
2. Set **Username** (i.e. `{{secrets.GRAPHQL_USERNAME}}`).
3. Set **Password** to the secret you created (i.e. `{{secrets.GRAPHQL_PASSWORD}}`).

### Bearer Token

#### Create a new connector secret

We advise you to keep your **Bearer Token** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `GRAPHQL_BEARER_TOKEN`) so you can reference it later in the connector.

#### Configure the Bearer Token

Select the **GraphQL connector** and fill out the following properties under the **Authentication** section:

1. Click **Bearer Token** in the **Authentication** section.
2. Set **Bearer** to the secret you created (i.e. `{{secrets.GRAPHQL_BEARER_TOKEN}}`).

### OAuth token

#### Create a new connector secret

We advise you to keep your **OAUTH_TOKEN_ENDPOINT** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `OAUTH_TOKEN_ENDPOINT`) so you can reference it later in the connector.

#### Configure the OAuth Token

Select the **GraphQL connector** and fill out the following properties under the **Authentication** section:

1. Click **OAuth 2.0** in the **Authentication** section.
2. Set **OAuth Token Endpoint** to the secret you created (i.e. `{{secrets.OAUTH_TOKEN_ENDPOINT}}`).
3. Set **Client ID** to the secret you created (i.e. `{{secrets.CLIENT_ID}}`).
4. Set **Client secret** to the secret you created (i.e. `{{secrets.CLIENT_SECRET}}`).
5. (Optional) Set **Scopes** (i.e. `read:clients`). Depending on the OAuth provider you're using, this may or may not be required.
6. Set **Audience** to the secret you created (i.e. `{{secrets.AUDIENCE}}`). This is an optional field depending on the OAuth provider you're using.
7. Choose **Client Authentication** from the dropdown menu (i.e. `Send client credentials in body`).

Find more information about the OAuth client credentials flow in the [RFC reference](https://www.rfc-editor.org/rfc/rfc6749#section-4.4).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/graphql
