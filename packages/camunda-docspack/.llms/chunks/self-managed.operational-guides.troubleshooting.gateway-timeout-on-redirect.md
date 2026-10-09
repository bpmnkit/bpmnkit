# Camunda components troubleshooting — Gateway timeout on redirect

A gateway timeout can occur if the headers of a response are too big (for example, if a JWT is returned as `Set-Cookie` header). To avoid this, you can increase the header buffer of your Ingress controller. For **ingress-nginx**, set the [`proxy-buffer-size` annotation](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#proxy-buffer-size). For **Contour**, the limit is enforced by Envoy rather than by an Ingress annotation, so it is raised on the Contour installation itself. See the [Contour configuration reference](https://projectcontour.io/docs/1.33/configuration/).


## Helm CLI version and installation failures

If you encounter errors during Helm chart installation, such as type mismatches or other template rendering issues, you may be using an unsupported version of the Helm CLI. Camunda 8.10 (chart 15.x) supports Helm CLI 3.10 or a later 3.x version, or Helm CLI 4.x.

For chart-to-CLI compatibility across versions, see [Helm CLI v4](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
