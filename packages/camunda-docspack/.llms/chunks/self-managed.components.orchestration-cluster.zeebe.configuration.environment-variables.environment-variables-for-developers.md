# Environment variables — Environment variables for developers

The following environment variables are intended for developers:

- `SPRING_PROFILES_ACTIVE=dev`: If this is set, the broker starts in a temporary folder and all data is cleaned up upon exit.
- `ZEEBE_DEBUG=true/false`: Activates a `DebugLogExporter` with default settings. The value of the environment variable toggles pretty printing.

**Note**
It is not recommended to use these settings in production.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/environment-variables
