# Deploy to Amazon ECS — Deploy Management Identity with OIDC authentication

[Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) is the Camunda 8 component responsible for authentication and authorization of the components outside the Orchestration Cluster, such as Camunda Hub. In this reference architecture, Management Identity is deployed as an additional ECS service and is only created when you switch the platform to OpenID Connect (OIDC) authentication.

Authentication is controlled by a single `authentication_mode` input in `terraform/cluster`:

| Mode              | Behavior                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basic` (default) | The Orchestration Cluster and Connectors use built-in users with generated passwords. No identity provider and no Management Identity are deployed.                                      |
| `oidc`            | The Orchestration Cluster, Connectors, and Management Identity authenticate through an OIDC provider. Management Identity is deployed, and Camunda Hub becomes available for deployment. |

To enable OIDC, set the following in your `terraform.tfvars` or pass it with `-var`:

```hcl
authentication_mode = "oidc"
```

Use `admin_claim_value` to choose which principal becomes the platform administrator. It defaults to `admin`, the user the bundled provider creates. With your own provider, set it to a principal that exists in your directory, otherwise nobody is granted the administrator role.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
