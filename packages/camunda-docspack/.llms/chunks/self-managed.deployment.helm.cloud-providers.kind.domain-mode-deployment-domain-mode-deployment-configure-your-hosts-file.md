# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Configure your hosts file

Run the hosts file configuration script to resolve `camunda.example.com` locally. The script requires `sudo` privileges, so you'll need to provide your password:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/hosts-add.sh
```

This adds the following entries to your `/etc/hosts` file:

```
127.0.0.1 camunda.example.com
127.0.0.1 zeebe-camunda.example.com
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
