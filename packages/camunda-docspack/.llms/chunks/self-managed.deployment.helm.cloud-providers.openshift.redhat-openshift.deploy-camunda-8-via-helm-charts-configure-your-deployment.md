# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — Configure your deployment

Start by copying the base Helm values file from the cloned repository into a working `values.yml` at the repository root:

```bash
cp generic/openshift/single-region/helm-values/base.yml values.yml
```

This file contains key-value pairs that will be substituted using `envsubst`.
Over this guide, you will merge additional overlays into this file to configure your deployment.

<!-- The overlays and merge order documented below are tested in CI by:
Repo: camunda/camunda-deployment-references
File: .github/workflows/aws_openshift_rosa_hcp_single_region_tests.yml
Keep both in sync when adding or modifying overlays. -->

Review the base Helm values

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/base.yml
```

**Danger: Merging YAML files**

This guide references multiple configuration files that need to be merged into a single YAML file. Be cautious to avoid duplicate keys when merging the files. Additionally, pay close attention when copying and pasting YAML content. Ensure that the separator notation `---` does not inadvertently split the configuration into multiple documents.

We strongly recommend double-checking your YAML file before applying it. You can use tools like [yamllint.com](https://www.yamllint.com/) or the [YAML Lint CLI](https://github.com/adrienverge/yamllint) if you prefer not to share your information online.

#### Configuring the Ingress

Before exposing services outside the cluster, we need an Ingress component. Here's how you can configure it:

**Danger: Exposure of the Zeebe Gateway Service**
For production-grade security, keep the Zeebe Gateway on a private network with no publicly reachable route, and access it only from internal workloads or over a secure private connection. This limits the attack surface and keeps process and job traffic inside your trusted network boundary.

Additionally, implement fine-grained [Kubernetes NetworkPolicies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) to explicitly allow only required internal components to initiate connections to the Zeebe Gateway Service. Deny all other Ingress traffic at the network layer to reduce blast radius if another workload in the cluster is compromised. See [required network traffic](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#required-network-traffic) for the flows Camunda depends on.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
