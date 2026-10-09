# Environments and Physical Tenants — Environment status

Camunda Hub sends an HTTP request to the `urls.readiness` address of each component of an environment to determine its status. The status of the environment is the worst result of its components. From worst to best, the order is **Unhealthy**, **Unknown**, **Healthy**. One **Unhealthy** component makes the environment **Unhealthy**, even if other components are **Unknown**. An environment is **Healthy** only if all of its components are Healthy.

| Component response                                                                                      | Status    |
| :------------------------------------------------------------------------------------------------------ | :-------- |
| A successful response, with no body or with a `status` of `up` or `ready`                               | Healthy   |
| An error response, or any other `status`                                                                | Unhealthy |
| No `readiness` address, no response within five seconds, a redirect, or a body without a `status` field | Unknown   |

A cluster that you configure with `url` instead of `components` has no readiness address, so its environments always have the status **Unknown**.

With the Helm chart, the `readiness` address of the Optimize component of a Physical Tenant is set only if you set `readinessUrl` for that component. Without it, the component has no readiness address, and the environment of the tenant has the status **Unknown**.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments
