# c8ctl CLI — Output modes

Switch between human-readable text and machine-readable JSON:

```bash
c8 output json    # all commands output JSON
c8 output text    # back to formatted tables (default)
```


## Environment variables

| Variable                    | Description          |
| :-------------------------- | :------------------- |
| `CAMUNDA_BASE_URL`          | Cluster base URL     |
| `CAMUNDA_CLIENT_ID`         | OAuth client ID      |
| `CAMUNDA_CLIENT_SECRET`     | OAuth client secret  |
| `CAMUNDA_TOKEN_AUDIENCE`    | OAuth token audience |
| `CAMUNDA_OAUTH_URL`         | OAuth token endpoint |
| `CAMUNDA_OAUTH_SCOPE`       | OAuth scope (space-separated) |
| `CAMUNDA_DEFAULT_TENANT_ID` | Default tenant ID    |

Environment variable conventions follow the [`@camunda8/orchestration-cluster-api`](https://www.npmjs.com/package/@camunda8/orchestration-cluster-api) module.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
