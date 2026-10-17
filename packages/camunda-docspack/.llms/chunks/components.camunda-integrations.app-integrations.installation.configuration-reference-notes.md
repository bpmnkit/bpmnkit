# Install app integrations — Configuration reference — Notes

- **`teams.multitenant`:** Multi-tenant support is no longer available for newly created Azure Bot registrations. Only set `multitenant` to `true` if you have an existing Teams application that was already registered with multi-tenant support enabled. For all new installations, leave this at the default (the CLI creates single-tenant apps) or explicitly set it to `false`.

- **`teams.serviceUrl`:** The default value (`https://smba.trafficmanager.net/teams`) works for most deployments. Only override it if your environment requires a different Bot Framework service endpoint. If you are unsure, keep the default value.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
