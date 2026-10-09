# Command reference — Commands — `add`

Add a profile

**Resources:** profile

**Positional arguments:**

- **profile:** `<name>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--baseUrl` | string |  | Cluster base URL |
| `--clientId` | string |  | OAuth client ID |
| `--clientSecret` | string |  | OAuth client secret |
| `--audience` | string |  | OAuth audience |
| `--oAuthUrl` | string |  | OAuth token URL |
| `--scope` | string |  | OAuth scope (space-separated) |
| `--defaultTenantId` | string |  | Default tenant ID |
| `--username` | string |  | Basic auth username |
| `--password` | string |  | Basic auth password |
| `--from-file` | string |  | Import from .env file |
| `--from-env` | boolean |  | Import from environment variables |
| `--header` | string |  | Custom HTTP header attached to every request made under this profile (format: "Name: value", repeatable) |
| `--exactBaseUrl` | boolean |  | Use --baseUrl exactly as given for every request, without appending /v2 |

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
