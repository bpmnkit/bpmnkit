# Upgrade to Camunda 8.10 — Upgrade sequence

The 8.9 to 8.10 upgrade spans several guides. Work through them in this order, rather than treating them as separate destinations.

| Step | What you do                                                                                            | Guide                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 1    | Confirm upgrade eligibility, review platform changes in 8.10, and verify infrastructure compatibility. | [Prepare for upgrade](https://docs.camunda.io/docs/next/self-managed/upgrade/prepare-for-upgrade)                                              |
| 2    | Create and update your 8.10 values file and run the upgrade.                                           | [Upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100)                            |
| 3    | Monitor and validate the upgrade before returning the deployment to normal use.                        | [Monitor and validate the upgrade](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#monitor-and-validate-the-upgrade) |

Review [component changes from 8.9 to 8.10](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100) alongside these steps for behavior changes affecting the components you run.

<!-- TODO: Update this when we have content

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/index
