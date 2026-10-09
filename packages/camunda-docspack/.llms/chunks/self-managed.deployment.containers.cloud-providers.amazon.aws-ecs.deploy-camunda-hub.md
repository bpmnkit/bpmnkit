# Deploy to Amazon ECS — Deploy Camunda Hub

[Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) is deployed as one additional ECS task running two containers: the REST API with the web interface, and a websockets relay used for real-time collaboration.

Camunda Hub is designed to interact with multiple orchestration clusters, so you deploy it once and connect it to every cluster it manages. This reference architecture registers the single Orchestration Cluster it deploys. To manage more clusters from the same Camunda Hub, add entries to the [`camunda.hub.clusters`](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters) list the module passes to the task.

Camunda Hub is optional and disabled by default. It authenticates through OIDC and cannot use Basic authentication, so it requires `authentication_mode = "oidc"`. It also requires `enable_camunda_hub_authorization`, which seeds Management Identity with the roles and permissions Camunda Hub checks against. Terraform fails during `terraform plan` with a precondition error if either is missing.

```hcl
authentication_mode              = "oidc"
enable_camunda_hub               = true
enable_camunda_hub_authorization = true
```

The following inputs control the deployment:

| Input                              | Description                                                                                                                                            | Default                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `enable_camunda_hub`               | Deploy the Camunda Hub ECS task. Requires `authentication_mode = "oidc"` and `enable_camunda_hub_authorization`.                                       | `false`                                          |
| `enable_camunda_hub_authorization` | Seed Management Identity with the resource servers, permissions, and roles Camunda Hub needs, and grant them to the administrator principal.           | `false`                                          |
| `camunda_hub_restapi_image`        | Container image for the Camunda Hub REST API and web interface.                                                                                        | The matching `camunda/hub` 8.10 image            |
| `camunda_hub_websockets_image`     | Container image for the Camunda Hub websockets relay.                                                                                                  | The matching `camunda/hub-websockets` 8.10 image |
| `camunda_hub_db_name`              | Name of the dedicated Camunda Hub database on the shared Aurora cluster.                                                                               | `camunda-hub`                                    |
| `camunda_hub_db_username`          | Database role for Camunda Hub. It authenticates with an IAM token, so it carries no password.                                                          | `camunda-hub`                                    |
| `camunda_license_key`              | Camunda license key. Leave empty to run Camunda Hub in trial mode. When set, it's stored in AWS Secrets Manager and injected as `CAMUNDA_LICENSE_KEY`. | `""`                                             |

Without the authorization seed, Camunda Hub still signs users in, so the deployment looks healthy while every project call is denied. Management Identity declares no roles by default, so the roles Camunda Hub asks about do not exist.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
