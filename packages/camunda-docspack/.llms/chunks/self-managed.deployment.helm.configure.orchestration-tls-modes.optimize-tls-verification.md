# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — Verification

```shell
kubectl -n <namespace> get deployment <release>-optimize \
  -o jsonpath='{.spec.template.spec.containers[0].env}' | jq '.[] | select(.name|startswith("SERVER_SSL_"))'

kubectl -n <namespace> get deployment <release>-optimize \
  -o jsonpath='{.spec.template.spec.containers[0].readinessProbe.httpGet.scheme}{"\n"}'

kubectl -n <namespace> get deployment <release>-optimize \
  -o jsonpath='{range .spec.template.spec.volumes[*]}{.name}{"\n"}{end}' | grep -E 'optimize-server-tls|keystore'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
