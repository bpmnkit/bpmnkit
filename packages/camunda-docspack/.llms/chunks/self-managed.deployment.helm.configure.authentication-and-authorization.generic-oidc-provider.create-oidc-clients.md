# Connect Camunda to any OIDC provider — Create OIDC clients

Create the following OIDC clients in your provider. The exact process varies by provider; consult your provider's documentation for client creation procedures.

| Client name           | Type         | Purpose                                          |
| --------------------- | ------------ | ------------------------------------------------ |
| Management Identity   | Confidential | User login and API authentication                |
| Orchestration Cluster | Confidential | User login and machine-to-machine authentication |
| Optimize              | Confidential | User login                                       |
| Web Modeler API       | Confidential | Programmatic API access                          |
| Web Modeler UI        | Public       | User login                                       |
| Console               | Public       | User login                                       |

**Tip**
For each client, record:

- Client ID
- Client secret (for confidential clients only)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
