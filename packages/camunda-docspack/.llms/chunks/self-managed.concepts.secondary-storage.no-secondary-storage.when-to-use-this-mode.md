# Run without secondary storage — When to use this mode

**Caution**
Before using this mode in production, consult your Camunda support or field team to ensure it meets your requirements.

Use this mode only in limited, specialized scenarios, such as the following:

| Scenario                                    | Description                                                                                   |
| :------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| Local development with Camunda 8 Run        | Run Zeebe locally without secondary storage components for lightweight testing and iteration. |
| Resource-constrained environments           | Deploy only the Zeebe engine when secondary storage or web applications cannot be supported.  |
| Temporary migration or diagnostic scenarios | Minimal orchestration functionality during transition or troubleshooting.                     |
| Custom monitoring or exporter development   | Use custom exporters or external observability tools instead of secondary storage.            |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
