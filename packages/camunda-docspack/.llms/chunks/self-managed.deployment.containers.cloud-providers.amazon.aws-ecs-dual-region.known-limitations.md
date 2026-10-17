# Dual-region setup (ECS Fargate) — Known limitations

- **Experimental.** This reference architecture is intended for learning and validation. Validate it against your own requirements before you run production workloads on it.
- **Manual failover only.** No automated health-check-driven failover is included. Run the [failover and failback scripts](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops) yourself.
- **Components.** Only the Orchestration Cluster and Connectors are deployed. Management Identity (Keycloak), Web Modeler, and Console aren't included, and Optimize isn't available with RDBMS secondary storage.
- **ECS deployment circuit breaker disabled.** The circuit breaker is off for both orchestration cluster services. On a first deploy, brokers fail ECS health checks for a while as Aurora IAM authentication warms up and the cross-region Raft quorum forms, which takes about 20 minutes. The circuit breaker would roll the deployment back before the cluster recovers. With the breaker off, ECS keeps retrying until the 30-minute `service_timeouts.create` deadline. Once the cluster is stable, you can re-enable it for later deployments.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
