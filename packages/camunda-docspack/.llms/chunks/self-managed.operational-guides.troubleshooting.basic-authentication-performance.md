# Camunda components troubleshooting — Basic authentication Performance

Throughput when using Basic authentication is very limited, supporting only a few API requests per second.
Workloads greater than that which can be supported by Basic authentication may cause request processing to stall,
as queued requests can time out before they are processed.

Development and testing scenarios that are performance-sensitive may
[disable authentication entirely](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#no-authentication-local-development),
or use
[OIDC Authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#using-a-token-oidcjwt).


## Find available container image versions

When working with custom registries or air-gapped environments, you may need to verify which image versions are available before deployment.

For Camunda's own images, use [skopeo](https://github.com/containers/skopeo) to list available tags:

```shell
# Open source images (no authentication required)
skopeo --override-os linux inspect docker://registry.camunda.cloud/camunda/zeebe | jq '.RepoTags'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
