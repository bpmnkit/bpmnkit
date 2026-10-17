# Dual-region setup (ECS Fargate) — Verify connectivity to Camunda 8

Using Terraform, you can obtain the HTTP endpoint of each Application Load Balancer and interact with Camunda through the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

**Warning: HTTPS**
To keep dependencies minimal and non-blocking for a quick start, this reference architecture omits a custom domain and TLS configuration.

You can add TLS by attaching an AWS Certificate Manager (ACM) certificate to each Application Load Balancer. For details, see the AWS documentation on [creating an HTTPS listener](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html). Information on configuring a custom domain is available in the [Application Load Balancer documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#dns-name).

Without these additions, traffic is transmitted in cleartext and is therefore insecure.

1. Navigate to the infra Terraform folder:

   ```bash
   cd terraform/infra
   ```

2. Retrieve an ALB endpoint. The dual-region setup is active-active, so either region's ALB works:

   ```bash
   terraform output -raw region_0_alb_endpoint
   terraform output -raw region_1_alb_endpoint
   ```

   Both ALBs expose the Orchestration Cluster and Connectors through the same port and use listener rules to determine the path they're on:
   - ALB:80
     - `/*` routes to the Orchestration Cluster UI and REST API.
     - `/connectors*` routes to the Connectors.
   - ALB:9600
     - Not forwarded to the management API (see [Endpoint reference](#endpoint-reference)).
     - Connectors combines the management port with the web server by default.
   - NLB:26500 (TCP)
     - Exposes the Orchestration Cluster Zeebe Gateway over gRPC. Retrieve the endpoint with `terraform output -raw region_0_nlb_grpc_endpoint` or `terraform output -raw region_1_nlb_grpc_endpoint`.

3. Access the URL of `region_0_alb_endpoint` (or `region_1_alb_endpoint`), which presents a login screen.

   The admin user is `admin`. The password is randomly generated and shared between regions. Retrieve it with:

   ```bash
   terraform output -raw admin_user_password
   ```

4. Use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to communicate with Camunda. Follow the [authentication example](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) to authenticate and retrieve the cluster topology.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
