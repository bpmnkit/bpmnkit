# Move from the Helm v3 CLI to v4 — Helm CLI v4 behavior changes to review {#helm-4-behavior-changes-to-review}

Helm CLI v4 enables server-side apply by default and removes some Helm CLI v3 plugin behaviors. Review these changes before your first install or upgrade with Helm CLI v4:

- [Helm CLI v4 server-side apply and post-renderer changes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4)


## Helm CLI v3 support {#helm-v3-support}

- Charts 14.x and 15.x support Helm CLI v3 and v4. With Helm CLI v3, these charts show a warning when you run `helm install` or `helm upgrade`. See [Camunda Helm chart compatibility](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4#camunda-helm-chart-compatibility).
- Helm CLI v3.22.0 is the final Helm CLI v3 minor release. See the [Helm v3 end-of-life announcement](https://helm.sh/blog/helm-v3-end-of-life/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/moving-helm-v3-to-v4
