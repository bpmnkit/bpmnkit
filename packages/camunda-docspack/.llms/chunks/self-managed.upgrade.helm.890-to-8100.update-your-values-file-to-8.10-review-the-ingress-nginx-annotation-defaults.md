# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Review the Ingress-nginx annotation defaults

In chart 14.x, `global.ingress.annotations` and `orchestration.ingress.grpc.annotations` had Ingress-nginx annotations as defaults. In chart 15.x, a compatibility shim adds them instead. The key `global.compatibility.nginx.renderAnnotations` controls this shim, and its default is `true`.

With the default, the chart renders the same annotations as in 8.9, except `ingress.kubernetes.io/rewrite-target`, which the chart no longer sets. The chart adds the annotations for any `ingressClassName` that you use. The chart emits a deprecation warning when the shim adds an annotation.

- If you use Ingress-nginx, you don't need to change anything for 8.10. To prepare your values file for the shim's removal and silence the warning, set all of the following annotations yourself. In `global.ingress.annotations`, set `ssl-redirect`, `proxy-buffering`, `proxy-buffer-size`, and `proxy-body-size`. In `orchestration.ingress.grpc.annotations`, set `ssl-redirect`, `backend-protocol`, and `proxy-buffer-size` when the gRPC Ingress renders.
- If you use another Ingress controller, set `global.compatibility.nginx.renderAnnotations: false`. Also configure the annotations that your controller needs.

For the annotation values and the Contour example, see [Ingress-nginx annotation defaults deprecated](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#ingress-annotation-defaults-deprecated).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
