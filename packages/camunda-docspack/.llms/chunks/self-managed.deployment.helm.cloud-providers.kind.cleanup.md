# Deploy Camunda 8 to a local kind cluster — Cleanup

**Warning: Destructive action**
This will permanently delete all Camunda 8 data in the local development cluster.

If you used the Makefile for setup, you can use the corresponding clean command:

```bash
# Domain mode
make domain.clean

# No-domain mode
make no-domain.clean
```

Alternatively, you can clean up manually:

```bash
# Delete cluster
kind delete cluster --name camunda-platform-local

# (domain mode) Remove hosts entries (requires sudo)
sudo sed -i '/camunda.example.com/d' /etc/hosts

# (no-domain mode) Remove Keycloak hosts entry (requires sudo)
sudo sed -i '/keycloak-service/d' /etc/hosts

# (domain mode) Clean certificates
rm -rf .certs
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
