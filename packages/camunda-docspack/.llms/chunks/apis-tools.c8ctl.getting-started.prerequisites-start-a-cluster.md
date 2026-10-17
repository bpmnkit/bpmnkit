# c8ctl CLI — Prerequisites — Start a cluster

```bash
# Start with the latest stable version (default)
c8 cluster start

# Start with a specific version
c8 cluster start 8.9.0-alpha5

# Start using a version alias
c8 cluster start stable
c8 cluster start alpha

# Start with a major.minor version (rolling release)
c8 cluster start 8.8
```

`c8ctl` automatically downloads the correct binary for your platform, caches it locally, launches the cluster in the background, and waits for it to become healthy.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
