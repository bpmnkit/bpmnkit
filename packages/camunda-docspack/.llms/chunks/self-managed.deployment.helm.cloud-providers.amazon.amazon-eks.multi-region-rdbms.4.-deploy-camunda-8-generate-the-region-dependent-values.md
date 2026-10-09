# Multi-region setup with RDBMS (EKS) — 4. Deploy Camunda 8 — Generate the region-dependent values

Three values cannot be hardcoded in the Helm values, because they depend on the deployed topology:

| Value                                  | Content                                                                        |
| :------------------------------------- | :----------------------------------------------------------------------------- |
| `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS` | One entry per active region, pointing at that region's headless Zeebe service. |
| `REGION_<slot>_ZEEBE_SERVICE_NAME`     | The suffix each broker advertises, so peers in other regions can resolve it.   |
| `CAMUNDA_MULTIREGION_ZONES`            | The zone list, covering the deployed slots only.                               |

```bash
. ./generate-zeebe-helm-values.sh
./assemble-envsubst-values.sh
```

**Note: Contact points are fully qualified**
The generated contact points end with a trailing dot, which marks them as fully qualified names. Without it, the resolver walks the pod's search domains first. On a cold multi-region start, a broker whose peer is not yet published can then exhaust its DNS budget and never finish starting. Always keep the trailing dot.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
