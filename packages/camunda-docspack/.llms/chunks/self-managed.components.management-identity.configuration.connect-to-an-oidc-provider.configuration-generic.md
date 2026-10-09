# Connect Management Identity to an identity provider — Configuration — generic

<h3>Steps</h3>

1. Identify what management and modeling components you need to use in Camunda 8: [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) and [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).
2. In your OIDC provider, **create an application for each of the management and modeling components you want to connect**. Hub requires two applications: one for the UI, and one for the API.
   - The expected redirect URI of the component you are configuring an app for can be found in [component-specific configuration](#component-specific-configuration).
**Note**
     Redirect URIs serve as an approved list of destinations across identity providers. Only the URLs specified in the redirect URIs configuration will be permitted as valid redirection targets for authentication responses. This security measure ensures that tokens and authorization codes are only sent to pre-approved locations, preventing potential unauthorized access or token theft.
3. For each management and modeling components, ensure the appropriate application type is used:
   - Web applications requiring confidential access/a confidential client:
     - **Optimize**
     - **Management Identity**
     - **Hub API**
   - Web applications requiring public access/a public client:
     - **Hub UI**
4. Make a note of the following values for each application you create:
   - Client ID
   - Client secret
   - Audience
5. Set the following environment variables or Helm values for the component you are configuring an app for:

**Note**
You can connect to your OIDC provider through either environment variables or Helm values. Ensure only one configuration option is used.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
