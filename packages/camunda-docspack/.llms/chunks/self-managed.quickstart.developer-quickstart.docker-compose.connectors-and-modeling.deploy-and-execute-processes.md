# Use connectors and deploy processes with Docker Compose — Deploy and execute processes

You can deploy and execute processes with either Desktop Modeler or Camunda Hub.

### Deploy with Desktop Modeler

[Desktop Modeler](https://camunda.com/download/modeler/) is a free, open-source desktop application for modeling BPMN, DMN, and Camunda Forms.

#### Lightweight configuration

To deploy from Desktop Modeler to the lightweight configuration:

1. Open Desktop Modeler and click the deployment icon.
1. Select **Camunda 8 Self-Managed**.
1. Configure the connection:
   - **Cluster endpoint:** `http://localhost:8080/v2`
   - **Authentication:** **None**
1. Click **Deploy**.

For more details, see [deploy to Self-Managed from Desktop Modeler](https://docs.camunda.io/docs/next/self-managed/components/modeler/desktop-modeler/deploy-to-self-managed).

#### Full configuration

To deploy from Desktop Modeler to the full configuration:

1. Open Desktop Modeler and click the deployment icon.
1. Select **Camunda 8 Self-Managed**.
1. Configure the connection:
   - **Cluster endpoint:** `http://localhost:8080/v2`
   - **Authentication:** **OAuth**
   - **OAuth URL:** `http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token`
   - **Client ID:** `orchestration`
   - **Client secret:** `secret`
   - **Audience:** `orchestration-api`
1. Click **Deploy**.

**Tip**
The full configuration uses Keycloak for OIDC authentication. The client credentials are preconfigured in the `.env` file and Management Identity configuration.

### Deploy with Camunda Hub

**Note**
Non-production installations of Camunda Hub are limited to five members per workspace. See [Licensing](https://docs.camunda.io/docs/next/reference/licenses).

[Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index) includes a browser-based modeler for creating and deploying BPMN, DMN, and form diagrams. Camunda Hub is included in the full configuration and can also run as a standalone setup.

#### Standalone setup

To start Camunda Hub, its WebSockets service, Management Identity, Keycloak, PostgreSQL, and Mailpit independently, run:

```shell
docker compose -f docker-compose-hub.yaml up -d
```

To stop Camunda Hub and remove all data and volumes, run:

```shell
docker compose -f docker-compose-hub.yaml down -v
```

#### Deploy or execute a process

When you use the full configuration, Camunda Hub connects automatically to the local Orchestration Cluster started by `docker-compose-full.yaml`. You can deploy and run processes directly from the Camunda Hub interface.

1. Log in to Camunda Hub at [http://localhost:8070](http://localhost:8070) with `demo` / `demo`.
1. [Create a workspace](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace#create-a-workspace).
1. In your workspace, create a new project.
1. In your project, [create a new BPMN diagram](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index).
1. Use the visual modeler to [design your BPMN process](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn).
1. Click **Deploy** to deploy the diagram to the preconfigured Orchestration Cluster.
1. After deployment, you can [create process instances](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation) and monitor them in [Operate](http://localhost:8080/operate).

Camunda Hub uses the `BEARER_TOKEN` authentication method to communicate with the Orchestration Cluster. The user's authentication token from Management Identity is used automatically for deployment.

**Note**
Camunda Hub is not included in the lightweight configuration. To use Camunda Hub with the lightweight configuration:

1. Run Camunda Hub separately with `docker-compose-hub.yaml`.
1. Manually configure the cluster connection in Camunda Hub.
1. Use `NONE` or `BASIC` authentication for the lightweight Orchestration Cluster.

For details, see [configure Camunda Hub clusters](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

#### Emails

The Docker Compose setup includes [Mailpit](https://github.com/axllent/mailpit) as a test SMTP server. Mailpit captures all emails sent by Camunda Hub, but does not forward them to actual recipients.

You can access emails in Mailpit at [http://localhost:8075](http://localhost:8075).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/connectors-and-modeling
