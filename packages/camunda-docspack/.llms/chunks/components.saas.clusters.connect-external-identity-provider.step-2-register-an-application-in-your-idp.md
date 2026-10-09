# Connect an external identity provider — Step 2: Register an application in your IdP

1. Register a new application/client for this cluster in your IdP.
2. Set the application's redirect URI (sometimes called a callback URL) to the value you copied in [step 1](#step-1-get-the-clusters-redirect-uri).
3. Enable OIDC support and configure the scopes you plan to use (Camunda defaults to `openid profile`).
4. Ensure the client is allowed to access user information.
5. Note the **client ID**, **client secret**, and **issuer URL**. You need these in the next step.


## Step 3: Configure the identity provider in Console

Back in the configuration dialog, fill in the following fields:

| Field                    | Description                                                                                                                                                                                                                                | Required                   |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| **Name (identifier)**    | A unique internal identifier for this provider. Lowercase letters and digits, starting with a letter (for example, `acmesso`). `oidc` is reserved for Camunda's built-in provider. You can't change this after you save the configuration. | Yes                        |
| **Display name**         | The name shown to users on the cluster's sign-in screen, alongside Camunda's built-in provider (labeled **Camunda**).                                                                                                                      | Yes                        |
| **Issuer URL**           | Your IdP's OIDC issuer URL. Camunda validates this against your provider's discovery document when you save. The issuer must be reachable from the public internet.                                                                        | Yes                        |
| **Client ID**            | The client ID from [step 2](#step-2-register-an-application-in-your-idp).                                                                                                                                                                  | Yes                        |
| **Client secret**        | The client secret from [step 2](#step-2-register-an-application-in-your-idp). Stored securely and never displayed again. When you edit an existing configuration, leave this blank to keep the current secret.                             | Yes on first configuration |
| **Scopes**               | Space-separated OIDC scopes to request. Defaults to `openid profile`.                                                                                                                                                                      | No                         |
| **Username claim**       | The access token claim Camunda uses as the username. Defaults to `sub`.                                                                                                                                                                    | No                         |
| **Client ID claim**      | The access token claim Camunda uses to identify machine-to-machine (M2M) clients. See [considerations for Microsoft Entra ID](#considerations-for-microsoft-entra-id) before you set this.                                                 | No                         |
| **Audiences**            | Space-separated audience (`aud`) values Camunda accepts in tokens from this provider.                                                                                                                                                      | No                         |
| **Additional JWKS URLs** | Space-separated HTTPS URLs, for providers that publish more than one JSON Web Key Set (JWKS) endpoint (for example, Ping Identity).                                                                                                        | No                         |

Confirm the checkbox acknowledging the lockout risk, then click **Save**.

**Warning**
A misconfigured identity provider can prevent its users from signing in. Camunda's built-in provider remains available as a fallback on the sign-in screen, so test your configuration with a non-critical account before relying on it for all users.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
