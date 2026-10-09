# Dual-region setup (ECS Fargate) — Verify connectivity to Camunda 8 — Endpoint reference

| Endpoint                  | Port  | Protocol | Purpose                                                                                                                                                                                                                                                          |
| ------------------------- | ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALB (region 0/1)          | 80    | HTTP     | Camunda REST API and Web UI (routes to container 8080).                                                                                                                                                                                                          |
| ALB (region 0/1)          | 9600  | HTTP     | Listener with a fixed empty response. No rule forwards it to the management API, because `enable_alb_http_management_listener_rule = false` in `terraform/app/camunda.tf`. Reach the management API through [Method B](#method-b--session-manager-port-forward). |
| NLB external (region 0/1) | 26500 | TCP      | Zeebe gRPC for clients.                                                                                                                                                                                                                                          |
| NLB internal (region 0/1) | 26502 | TCP      | Zeebe Raft, cross-region, private.                                                                                                                                                                                                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
