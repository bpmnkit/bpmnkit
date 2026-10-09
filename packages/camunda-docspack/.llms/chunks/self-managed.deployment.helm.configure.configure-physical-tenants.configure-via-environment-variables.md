# Configure Physical Tenants in Helm chart — Configure via environment variables

For a small number of overrides, set individual properties through `orchestration.env` instead of a full configuration block:

```yaml
orchestration:
  env:
    - name: CAMUNDA_PHYSICALTENANTS_RISKPROD_DATA_SECONDARYSTORAGE_RDBMS_URL
      value: jdbc:postgresql://db/riskprod
```

Environment variables and `orchestration.configuration` can be combined. Use the same normalized tenant key in both. See [environment variable mapping](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference#environment-variables) for the full conversion rules.


## Related pages

- [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)
- [Set up two isolated Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started)
- [Configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference)
- [Authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization)
- [Configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants)
- [Install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants
