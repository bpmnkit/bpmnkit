# Connect Management Identity to an identity provider — Configuration — microsoftEntraId

<h3>Steps</h3>

**Note**
Ensure you register a new application for each component.

1. Identify what management and modeling components you need to use in Camunda 8: [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) and [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).
2. Within the Entra ID admin center, [register a new application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) for **each component you would like to connect**. Hub requires two applications: one for the UI, and one for the API.
3. Navigate to the new application's **Overview** page, and make note of the **Client ID**. This will also be used as the audience ID.
4. Within your new application, [configure a platform](https://learn.microsoft.com/en-gb/entra/identity-platform/quickstart-register-app#configure-platform-settings) for the appropriate component:
   - **Web**:
     - Optimize
     - Management Identity
     - Hub API
   - **Single-page application**:
     - Hub UI
5. Add your component's **Microsoft Entra ID** redirect URI, found under [Component-specific configuration](#component-specific-configuration).
**Note**
   Redirect URIs serve as an approved list of destinations across identity providers. Only the URLs specified in the redirect URIs configuration will be permitted as valid redirection targets for authentication responses. This security measure ensures that tokens and authorization codes are only sent to pre-approved locations, preventing potential unauthorized access or token theft.
6. [Create a new client secret](https://learn.microsoft.com/en-gb/entra/identity-platform/quickstart-register-app?tabs=client-secret#add-credentials), and note the new secret's value for later use. The secret ID is not needed, only the secret value is required.
7. Set the following environment variables or Helm values for the component you are configuring an app for:

**Note**
You can connect to your OIDC provider through either environment variables or Helm values. Ensure only one configuration option is used.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
