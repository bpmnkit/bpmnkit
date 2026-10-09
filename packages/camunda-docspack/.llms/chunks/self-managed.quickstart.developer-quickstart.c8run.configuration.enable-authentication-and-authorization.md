# Configure Camunda 8 Run — Enable authentication and authorization

By default, Camunda 8 Run is optimized for local development. The web applications use local credentials, but the Orchestration Cluster API is unprotected and authorization checks are disabled. To protect API requests and enable authorization checks, update your `application.yaml`.

Example configuration:

```yaml
camunda:
  security:
    initialization:
      users:
        - username: demo
          password: demo
          name: Demo
          email: demo@example.com
    authentication:
      method: BASIC
      unprotected-api: false
    authorizations:
      enabled: true
```

Start Camunda 8 Run with the configuration:

### maclinux

```bash
./start.sh --config application.yaml
```

### windows

```bash
.\c8run.exe start --config application.yaml
```

Once enabled, API requests must include valid credentials. For example:

```shell
curl --request GET 'http://localhost:8080/v2/topology' \
  -u demo:demo \
  --header 'Content-Type: application/json' \
  --data-raw '{}'
```

To add additional users, extend the configuration:

```yaml
camunda:
  security:
    initialization:
      users:
        - username: user
          password: user
          name: user
          email: user@example.com
      defaultRoles:
        admin:
          users:
            - user
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
