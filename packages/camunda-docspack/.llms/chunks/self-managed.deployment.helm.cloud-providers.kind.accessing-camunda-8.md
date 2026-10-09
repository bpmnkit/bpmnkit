# Deploy Camunda 8 to a local kind cluster — Accessing Camunda 8

### domain

**Note**
Optimize is only available with Elasticsearch secondary storage. If you deployed with `SECONDARY_STORAGE=postgres`, Optimize is disabled.

| Component                      | URL                                            | Availability                         |
| ------------------------------ | ---------------------------------------------- | ------------------------------------ |
| Operate                        | https://camunda.example.com/operate            | All                                  |
| Tasklist                       | https://camunda.example.com/tasklist           | All                                  |
| Admin                          | https://camunda.example.com/admin              | All                                  |
| Management Identity            | https://camunda.example.com/managementidentity | All                                  |
| Optimize                       | https://camunda.example.com/optimize           | Elasticsearch secondary storage only |
| Orchestration Cluster REST API | https://camunda.example.com/                   | All                                  |
| Keycloak                       | https://camunda.example.com/auth               | All                                  |

### no-domain

**Note**
Optimize is only available with Elasticsearch secondary storage. If you deployed with `SECONDARY_STORAGE=postgres`, Optimize is disabled and its port-forward is skipped automatically.

Start port-forwarding to access the services:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/port-forward.sh
```

**Tip: Localhost development with kubefwd**
For a richer localhost experience, and to avoid managing many individual port-forward commands, you can use [kubefwd](https://github.com/txn2/kubefwd) to forward all services in the target namespace and make them resolvable by their in-cluster DNS names on your workstation. This requires `sudo` to bind privileged ports and modify `/etc/hosts`:

```shell
sudo kubefwd services -n "camunda"
```

Now, you can reach services directly, for example:

- **Management Identity**: `http://camunda-identity/managementidentity`
- **Keycloak**: `http://keycloak-service:18080/auth`
- **Zeebe Gateway gRPC**: `camunda-zeebe-gateway:26500`

You can still use localhost ports if you prefer traditional port-forwarding. Stop kubefwd with **Ctrl+C** when finished. Be aware kubefwd modifies your `/etc/hosts` temporarily, then restores the file when it exits.

| Component            | URL                                | Availability                         |
| -------------------- | ---------------------------------- | ------------------------------------ |
| Zeebe Gateway (gRPC) | localhost:26500                    | All                                  |
| Zeebe Gateway (HTTP) | http://localhost:8080/             | All                                  |
| Operate              | http://localhost:8080/operate      | All                                  |
| Tasklist             | http://localhost:8080/tasklist     | All                                  |
| Admin                | http://localhost:8080/admin        | All                                  |
| Management Identity  | http://localhost:8085              | All                                  |
| Optimize             | http://localhost:8083              | Elasticsearch secondary storage only |
| Camunda Hub          | http://localhost:8070              | All                                  |
| Connectors           | http://localhost:8088              | All                                  |
| Keycloak             | http://keycloak-service:18080/auth | All                                  |

**Tip: Connecting to the Orchestration Cluster**
To interact with the Orchestration Cluster via Zeebe Gateway using the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) or a local client/worker, connect to `localhost:26500` (gRPC) or `http://localhost:8080` (REST).

At any time, run `kubectl get services -n camunda` to get a full list of deployed Camunda components and their network properties.

### Default credentials

#### Camunda admin

- **Username**: `admin`
- **Password**: Run the following script

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/get-password.sh
```

#### Keycloak admin

The Keycloak operator generates a separate set of admin credentials stored in the `keycloak-initial-admin` secret. These credentials are different from the Camunda admin credentials and are used to access the Keycloak administration console.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/get-keycloak-password.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
