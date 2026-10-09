# c8ctl CLI — Prerequisites — Manage cached versions

```bash
# List locally cached versions and available aliases
c8 cluster list

# List all versions available on the remote download server
c8 cluster list-remote

# Download a version without starting it
c8 cluster install 8.8

# Remove a locally cached version
c8 cluster delete 8.8

# Delete a version's runtime data but keep the binary (the next start is fresh)
c8 cluster purge 8.8

# Or stop the running cluster and purge its runtime data in one step
c8 cluster stop --purge
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
