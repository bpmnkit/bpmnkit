# Deploy to Amazon ECS — Deploy Management Identity with OIDC authentication — Choose an OIDC provider

The reference architecture ships a bundled OIDC provider so the stack runs end-to-end without an external dependency. Every Camunda component reads a single provider-agnostic OIDC interface, so the bundled provider and your own provider are wired the same way.

To use your own provider, such as Microsoft Entra ID or Okta, set the `external_oidc` object. The bundled provider is then skipped entirely.

| Field                             | Required | Description                                                                                                                       |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `issuer_uri`                      | Yes      | Issuer URI of your OIDC provider, used for discovery and token validation.                                                        |
| `token_uri`                       | Yes      | Token endpoint used for machine-to-machine authentication.                                                                        |
| `orchestration_audience`          | Yes      | Audience the Orchestration Cluster validates on incoming tokens.                                                                  |
| `identity_audience`               | Yes      | Audience for Management Identity's own resource server. Keep it separate from the Orchestration Cluster audience.                 |
| `identity_client_id`              | Yes      | Client ID registered for Management Identity.                                                                                     |
| `identity_client_secret_arn`      | Yes      | Secrets Manager ARN holding the Management Identity client secret.                                                                |
| `orchestration_client_id`         | Yes      | Client ID registered for the Orchestration Cluster.                                                                               |
| `orchestration_client_secret_arn` | Yes      | Secrets Manager ARN holding the Orchestration Cluster client secret.                                                              |
| `connectors_client_id`            | Yes      | Client ID registered for Connectors.                                                                                              |
| `connectors_client_secret_arn`    | Yes      | Secrets Manager ARN holding the Connectors client secret.                                                                         |
| `username_claim`                  | No       | Claim that carries the user name. Defaults to `preferred_username`.                                                               |
| `client_id_claim`                 | No       | Claim that identifies the calling application. Defaults to `client_id`. Microsoft Entra ID uses `azp` (v2) or `appid` (v1).       |
| `connectors_token_scope`          | No       | Scope Connectors requests on the client credentials call. Empty by default. Microsoft Entra ID v2 requires `<resource>/.default`. |

Register one client per component in your provider, store each client secret in AWS Secrets Manager, and reference the secrets by ARN. Terraform never accepts raw secret values here. Every required field must be non-empty once `external_oidc` is set, and `external_oidc` is only valid together with `authentication_mode = "oidc"`. Both rules are enforced by plan-time preconditions.

The Orchestration Cluster and Management Identity are separate resource servers, so they need separate audiences. Pointing both at one value aims Management Identity's permissions at the Orchestration Cluster API.

**Note**
Encrypt the client secrets either with the AWS-managed Secrets Manager key or with the same customer-managed key this stack uses through `secrets_kms_key_arn`. The ECS task role can decrypt only one key, so a secret under any other customer-managed key fails at task start with `ResourceInitializationError`.

```hcl
authentication_mode = "oidc"

external_oidc = {
  issuer_uri                      = "https://login.example.com/realms/camunda"
  token_uri                       = "https://login.example.com/realms/camunda/protocol/openid-connect/token"
  orchestration_audience          = "camunda-api"
  identity_audience               = "camunda-identity-resource-server"
  identity_client_id              = "camunda-identity"
  identity_client_secret_arn      = "arn:aws:secretsmanager:eu-central-1:123456789012:secret:identity-client-secret"
  orchestration_client_id         = "orchestration"
  orchestration_client_secret_arn = "arn:aws:secretsmanager:eu-central-1:123456789012:secret:orchestration-client-secret"
  connectors_client_id            = "connectors"
  connectors_client_secret_arn    = "arn:aws:secretsmanager:eu-central-1:123456789012:secret:connectors-client-secret"
}
```

**Warning**
Browser-based OIDC login does not complete over plain HTTP. Set `alb_certificate_arn` to an AWS Certificate Manager (ACM) certificate ARN before enabling OIDC, and set `alb_public_hostname` to the DNS name clients use to reach the load balancer, such as `camunda.example.com`. Both are needed together: every OIDC URL is built from the public host name, and ACM cannot issue a certificate for the load balancer's own `*.elb.amazonaws.com` name. Terraform fails at plan time if you set the certificate without the host name. The Application Load Balancer then serves an HTTPS listener on port 443 and redirects port 80 to it. Use `alb_ssl_policy` to change the negotiated SSL policy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
