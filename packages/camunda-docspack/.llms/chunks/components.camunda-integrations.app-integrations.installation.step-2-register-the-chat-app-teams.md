# Install app integrations — Step 2: Register the chat app — teams

Skip this tab if you are not registering Microsoft Teams.

Install the CLI:

```bash
npm install -g @camunda/app-integration-cli
```

Create a new Teams app project:

```bash
c8-teams create my-teams-app
```

The CLI prompts you for:

- A project/package name.
- The application display name.
- Your App Integrations backend URL.
- Whether to create a new Teams app and Entra (Azure AD) app or use existing ones.

Build and deploy:

```bash
cd my-teams-app
pnpm install
c8-teams build
```

The `build` command compiles the app package from the template and deploys it. You can also deploy separately as follows:

```bash
c8-teams deploy
```

This provisions the app in your Microsoft Teams tenant and publishes it to the Teams Admin Portal for approval. After a successful deployment, the CLI automatically prints the `teams` configuration snippet (including `clientId`, `appId`, `appPassword`, `tenantId`, and `tabEndpoint`) ready to paste into your `config.yaml`.

Save this output for [Step 4](#step-4-create-the-configuration-file).

**Tip**
If you need to retrieve the configuration snippet again later, run:

```bash
c8-teams show-config
```

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
