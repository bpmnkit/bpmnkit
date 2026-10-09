# Dual-region setup (ECS Fargate) — Known limitations

- **Node ID assignment.** Even/odd broker ID assignment per region is pending follow-up work.
- **Manual failover only.** No automated health-check-driven failover is included.


## Next steps

After you have a working dual-region deployment, consider the following:

- [Connect to an identity provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider) to integrate with an external identity system.
- Add TLS by attaching an [AWS Certificate Manager (ACM) certificate](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html) to the Application Load Balancers.
- Review the [dual-region concept documentation](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) for current limitations and operational considerations.
- Browse the [single-region ECS Fargate guide](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs) for a comparison with the simpler single-region pattern.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
