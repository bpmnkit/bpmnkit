# Install app integrations — Prerequisites

Before you begin, ensure the following are available.

Shared, regardless of which platforms you register:

- A running Camunda Self-Managed distribution (for example, `camunda.your-domain.com`) with Identity (Keycloak or Microsoft Entra).
- Docker installed on the system hosting the App Integrations backend.
- A PostgreSQL database accessible from the Docker container.
- Node.js 20 or later, for the app integration CLI.
- A DNS name for the App Integrations backend (for example, `app-integrations.camunda.your-domain.com`).

If you are registering Microsoft Teams:

- Microsoft Teams with admin permissions to add apps.

If you are registering Slack:

- A Slack workspace.
- The backend DNS name must be reachable from the internet over **HTTPS**. Slack calls the backend directly, and there is no socket mode.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
