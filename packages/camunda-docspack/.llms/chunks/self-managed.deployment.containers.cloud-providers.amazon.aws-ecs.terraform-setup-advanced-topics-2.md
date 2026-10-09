# Deploy to Amazon ECS — Terraform setup — Advanced Topics (2)

Terraform itself can't do this initial seeding as the Aurora PostgreSQL is not publicly exposed, so a workaround is needed. In our reference architecture to keep things simple and working ideally immediately, a local execution was used that triggers a one time seeding job to do the required steps as the ECS has access to Aurora PostgreSQL cluster.

As previously mentioned, if you don't want to do this local execution, you can delete the `postgres_seed.tf` and remove the `depends_on` in `camunda.tf`.

Alternatives are for example:

- Externally supplied PostgreSQL
- Rely on username / password of e.g. admin user
- Manual seeding via an EC2 instance or ECS task in the same VPC or a connected VPN
- Temporarily exposing the Aurora PostgreSQL cluster (not recommended)
- AWS Lambda function that does the seeding
- AWS Step function that does the seeding

It was implemented as a `local exec` with an ECS task since we wanted to provide a fully working reference end-to-end while still relying on something like IAM authentication.

#### Rolling deployments

The Orchestration Cluster is stateful and overprovisioning will not help the deployment to reach a ready state quicker as we're limited by the Zeebe node-ids and brokers only becoming ready when successfully joining a cluster. Therefore, the Orchestration Cluster does a deployment of maximum `100%` of tasks and minimum `66%` to ensure quorum is kept. If using smaller task sizes, you may have to consider using `service_force_new_deployment = true` to force a new deployment as otherwise the minimum and maximum task size will block a successful update.

For the Connectors task, it's kept at a maximum of `200%` and minimum of `50%` as the application is stateless and can therefore scale above the initial target during upgrades.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
