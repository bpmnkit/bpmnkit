# Command reference — Commands — `update`

Update the retries or timeout of a job. At least one of --retries or --timeout must be provided.

**Resources:** job

**Positional arguments:**

- **job:** `<key>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--retries` | string |  | New number of retries for the job |
| `--timeout` | string |  | New job timeout in milliseconds |
| `--operationReference` | string |  | Optional operation reference (long integer) |

**Examples:**

```bash
c8ctl update job 12345 --retries 3                          # Set the retry count for a job
c8ctl update job 12345 --timeout 60000                      # Set the job timeout to 60 seconds
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
