# Deploy to Amazon ECS — Verify connectivity to Camunda 8

Using Terraform, you can obtain the HTTP endpoint of the Application Load Balancer and interact with Camunda through the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

**Warning: HTTPS**

To keep dependencies minimal and non-blocking for a quick start, this reference architecture omits a custom domain and TLS configuration.

You can easily add TLS by attaching an AWS Certificate Manager (ACM) certificate to the Application Load Balancer (ALB). For details, see the AWS documentation on [creating an HTTPS listener](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html).

Information on configuring a custom domain and understanding the ALB DNS name is available in the [Application Load Balancer documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#dns-name).

Without these additions, information is transmitted in plaintext and is therefore insecure.

1. Navigate to the Terraform folder:

```sh
cd terraform
```

2. Retrieve the Application Load Balancer output:

```sh
terraform output -raw alb_endpoint
```

The ALB exposes both the Orchestration and Connectors through the same port and uses listener rules with weights to determine the path they're on.

- ALB:80 (ALB:443 when you set `alb_certificate_arn`)
  - `/*` routes to the Orchestration Cluster UI/REST API
  - `/connectors*` routes to the Connectors
  - `/hub*` routes to Camunda Hub and `/hub-ws*` to its websockets relay, when `enable_camunda_hub = true`
  - `/identity*` routes to Management Identity, when OIDC is enabled
- ALB:9600 (optional - not recommended to be exposed publicly)
  - `/*` routes to the Orchestration Cluster
  - Connectors has the management port with the web server combined by default
- NLB:26500 (TCP)
  - Exposes the Orchestration Cluster - Zeebe Gateway with gRPC

3. Access the URL of `alb_endpoint` which should present you a login screen.

   The administrator user name is `admin` in both authentication modes, but the password is stored in a different place. Select the mode you deployed:

   
   
### basic

   The admin user name as pre-configured in `camunda.tf` is `admin` and the password is randomly generated and can be retrieved via:

   ```sh
   terraform output -raw admin_user_password
   ```

   
   
### oidc

   You sign in as the `admin` user of the identity provider, which is a different account from the built-in user used in Basic authentication. The `admin_user_password` output does not return this password, and no Terraform output exposes it. Read it from AWS Secrets Manager instead, where `<prefix>` is the value of the `prefix` input (`camunda` by default):

   ```sh
   aws secretsmanager get-secret-value \
     --secret-id camunda-oc1-realm-admin-user-password \
     --query SecretString \
     --output text
   ```

   When you bring your own provider through `external_oidc`, this secret is not created. Sign in with an account from your provider instead, and make sure the claim named by `username_claim` matches the value of `admin_claim_value`.

   
   

4. Use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to communicate with Camunda:

   Follow the example in the [Orchestration Cluster REST API documentation](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) to authenticate and retrieve the cluster topology.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
