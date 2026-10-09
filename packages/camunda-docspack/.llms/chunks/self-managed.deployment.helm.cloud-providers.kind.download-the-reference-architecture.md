# Deploy Camunda 8 to a local kind cluster — Download the reference architecture

Download the reference architecture files you'll use throughout this guide:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/get-your-copy.sh
```

You'll run all subsequent commands from `camunda-deployment-references/local/kubernetes/kind-single-region/`.

Before proceeding, take some time to explore the repository structure and understand the configuration files, scripts, and Helm values. This will help you understand what each step does and how to customize the deployment for your needs.

**Tip: Quick setup with Makefile**
The reference architecture includes a `Makefile` with useful commands to automate the entire deployment process. If you [exported `SECONDARY_STORAGE`](#secondary-storage-options) above, you can omit it from these commands. Otherwise, set it inline:

```bash
# PostgreSQL secondary storage (lighter, no Optimize)
SECONDARY_STORAGE=postgres make domain.init      # With TLS (requires mkcert)
SECONDARY_STORAGE=postgres make no-domain.init   # With port-forward

# Elasticsearch secondary storage (full platform with Optimize)
SECONDARY_STORAGE=elasticsearch make domain.init      # With TLS (requires mkcert)
SECONDARY_STORAGE=elasticsearch make no-domain.init   # With port-forward
```

To clean up, use `make domain.clean` or `make no-domain.clean` respectively.

Run `make help` to see all available targets, or consult the [Makefile](https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/Makefile) directly.

The following sections detail each step if you prefer to run them manually or want to understand the process. If you've used the quick setup commands above, you can skip ahead to [Accessing Camunda 8](#accessing-camunda-8).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
