# Upgrade Camunda components from 8.9 to 8.10 — Console configuration

If you use a custom configuration, review this section and the following ones, and make applicable changes. Otherwise, they are not applicable to your setup.

Console no longer exists in 8.10. Therefore, if you've configured Console with custom settings, remove those settings:

- If using application properties, remove the top-level `camunda.console` object.
- If using environment variables, remove the following variables:
  - `CAMUNDA_CONSOLE_CONTEXT_PATH`
  - `CAMUNDA_CONSOLE_CUSTOMERID`
  - `CAMUNDA_CONSOLE_DISABLE_AUTH`
  - `CAMUNDA_CONSOLE_EXPERIMENTAL_DISCOVERY_MODE`
  - `CAMUNDA_CONSOLE_INSTALLATIONID`
  - `CAMUNDA_CONSOLE_REDIRECT_TRAILING_SLASH`
  - `CAMUNDA_CONSOLE_REDIRECT_URL`
  - `CAMUNDA_CONSOLE_TELEMETRY`

The application fails on startup if any of these are configured, whether as an application property or as one of the environment variables above.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
