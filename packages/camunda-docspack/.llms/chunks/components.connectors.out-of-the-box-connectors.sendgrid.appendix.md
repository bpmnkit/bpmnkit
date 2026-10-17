# SendGrid connector — Appendix

### Create a SendGrid account

To use the **SendGrid connector**, create a free account in SendGrid if you do not have one yet:

1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/).
2. Set up the account with your email and choose a password.
3. Click **Create Account**.
4. Provide further information required by SendGrid.
5. Click **Get Started**.

### Create a sender identity

Before sending your first email, you'll need to create a sender identity and verify it.

1. Click **Settings > Sender Authentication** or click [here](https://app.sendgrid.com/settings/sender_auth).
2. Choose **Verify a Single Sender** for demo purposes (or alternatively **Authenticate Your Domain** for a production setup.)
3. Provide the details requested by SendGrid in the form and click **Create**.
4. Go to your email inbox and open the email sent to you by SendGrid.
5. Click **Verify Single Sender**.

### Create an API key

To create an API key in SendGrid, take the following steps:

1. Log in to your new account.
2. Go to **Settings**.
3. Click **API Keys > Create API Key**.
4. Give your key a name (i.e. `my-camunda-connector-key`).
5. Click **Create Key**.
6. Copy the **API Key** and move on to the next step for creating a connector secret.

### Create a new connector secret

We advise you to keep your API key safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret `SEND_GRID_API_KEY` so you can reference it later in the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sendgrid
