# Deploy to Amazon ECS — Deploy Management Identity with OIDC authentication — How components authenticate in OIDC mode

| Component             | Flow                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestration Cluster | Authorization code flow for the web components. The user identifier is taken from the `preferred_username` claim, and `admin` is granted the admin role. |
| Connectors            | Client credentials (machine-to-machine) against the token endpoint, mapped to the Connectors role.                                                       |
| Management Identity   | Generic OIDC client against the same issuer, using its own client ID and audience.                                                                       |

For your own scripts and clients, retrieve the machine-to-machine values from the Terraform outputs:

```sh
terraform output -raw oidc_token_url
terraform output -raw orchestration_oidc_client_id
terraform output -raw orchestration_oidc_client_secret
terraform output -raw connectors_oidc_client_id
terraform output -raw connectors_oidc_client_secret
```

These outputs are empty in `basic` mode. The client secret outputs are only populated for the bundled provider, because an external provider issues and stores its own secrets.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
