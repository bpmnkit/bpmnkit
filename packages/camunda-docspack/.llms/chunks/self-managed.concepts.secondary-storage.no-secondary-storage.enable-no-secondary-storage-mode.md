# Run without secondary storage — Enable **no secondary storage** mode

You can enable this mode in several ways depending on your deployment method.

### helm

To disable secondary storage in Helm-based installations, set the following flag in your `values.yaml` file:

```yaml
global:
  noSecondaryStorage: true
```

When this value is set, the Helm charts automatically disable all components that depend on secondary storage.

### c8run

To disable secondary storage in Camunda 8 Run or other manual setups, set the following property in your configuration file:

```yaml
spring:
  profiles:
    active: broker,standalone

camunda:
  data:
    secondary-storage:
      type: none
```

Or use environment variables:

```yaml
SPRING_PROFILES_ACTIVE=broker,standalone
CAMUNDA_DATA_SECONDARYSTORAGE_TYPE=none
```

If brokers and gateways run separately, apply the same configuration for gateways:

```yaml
spring:
  profiles:
    active: gateway,standalone

camunda:
  data:
    secondary-storage:
      type: none
```

```bash
SPRING_PROFILES_ACTIVE=gateway,standalone
CAMUNDA_DATA_SECONDARYSTORAGE_TYPE=none
```

### docker-compose

In a Docker Compose setup, you can disable secondary storage by setting the following environment variable for the relevant service:

```yaml
environment:
  - CAMUNDA_DATA_SECONDARYSTORAGE_TYPE=none
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
