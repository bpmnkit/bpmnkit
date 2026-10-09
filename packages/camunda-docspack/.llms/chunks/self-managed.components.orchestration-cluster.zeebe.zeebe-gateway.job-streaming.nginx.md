# Job streaming — Nginx

Nginx is a known proxy which does not support forward HTTP/2 pings from either side as a form of keepalive. To resolve related gateway timeouts, configure an appropriate `grpc_send_timeout` that it is _higher_ than your job worker stream timeout configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/job-streaming
