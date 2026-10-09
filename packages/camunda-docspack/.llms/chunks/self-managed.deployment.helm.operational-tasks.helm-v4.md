# Helm 4

Learn how Helm CLI v4 behavior affects Camunda Helm chart installs and upgrades.

Learn how Helm CLI v4 behavior can affect Camunda Helm chart installs and upgrades, and how to apply workarounds.

**Note: Switching from Helm v3**
Switching CLIs does not require a release-state migration; Helm is client-side only. See [Move from the Helm v3 CLI to v4](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/moving-helm-v3-to-v4).

**Info**
Learn more about Helm CLI v4 changes in the [Helm documentation](https://helm.sh/docs/overview/#whats-new).


## Camunda Helm chart compatibility

Helm CLI compatibility depends on the Camunda Helm chart version.

| Chart version             | Helm CLI v3 | Helm CLI v4 |
| ------------------------- | ----------- | ----------- |
| Camunda 8.6 – Chart 11.x  | ✅          | ❌          |
| Camunda 8.7 – Chart 12.x  | ✅          | ❌          |
| Camunda 8.8 – Chart 13.x  | ✅          | ❌          |
| Camunda 8.9 – Chart 14.x  | ✅          | ✅ \*       |
| Camunda 8.10 – Chart 15.x | ✅          | ✅ \*       |

\* Helm CLI v4 may require workarounds when overriding environment variables. See [Workarounds](#workarounds).

When you use Helm CLI v3, charts 12.x to 15.x require version 3.10 or later. Charts 14.x and 15.x also show a warning when you run `helm install` or `helm upgrade`. The warning appears in command output and in a ConfigMap with a name ending in `-warnings`. It does not block either command.

<!-- Keep this warning in sync with the chart template: https://github.com/camunda/camunda-platform-helm/blob/main/charts/camunda-platform-8.10/templates/common/constraints.tpl. -->

```text
[camunda][warning] Helm CLI <version> detected. Helm v3 receives security fixes only until February 10, 2027 (https://helm.sh/blog/helm-v3-end-of-life/). Upgrade to Helm v4 before then: https://helm.sh/docs/overview
```

Camunda recommends Helm CLI v4 and supports it for the full release cycles of Camunda 8.9 and 8.10. Camunda supports Helm CLI v3 (3.10 or later) until February 10, 2027, when upstream support ends. After February 10, 2027, Camunda no longer supports Helm CLI v3. Customers who continue to use Helm CLI v3 after that date do so at their own risk.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4
