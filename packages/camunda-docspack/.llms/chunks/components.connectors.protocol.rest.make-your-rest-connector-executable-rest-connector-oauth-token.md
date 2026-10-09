# REST connector — Make your REST connector executable — REST connector (OAuth token)

#### Create a new connector secret

We advise you to keep your **OAUTH_TOKEN_ENDPOINT** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (i.e `OAUTH_TOKEN_ENDPOINT`) so you can reference it later in the connector.

#### Configure the OAuth token

Select the **REST connector** and fill out the following properties under the **Authentication** section:

1. Click **OAuth 2.0** in the **Authentication** section.
2. Set **OAuth token endpoint** to the secret you created (i.e. `{{secrets.OAUTH_TOKEN_ENDPOINT}}`).
3. Set **Client ID** to the secret you created (i.e. `{{secrets.CLIENT_ID}}`).
4. Set **Client secret** to the secret you created (i.e. `{{secrets.CLIENT_SECRET}}`).
5. (Optional) Set **Scopes** (i.e. `read:clients`). Depending on the OAuth provider you're using, this may or may not be required.
6. Set **Audience** to the secret you created (i.e. `{{secrets.AUDIENCE}}`). It is an optional field. Depending on the OAuth provider you're using, you should fill this field or not.
7. Choose **Client authentication** from the dropdown menu (i.e. `Send client credentials in body`).

Find more information about the OAuth client credentials flow at the [RFC reference](https://www.rfc-editor.org/rfc/rfc6749#section-4.4).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
