# Red Hat OpenShift — Verify connectivity to Camunda 8 — without

Admin and the Orchestration cluster must be port-forwarded to be able to connect to the cluster. If using Keycloak via the Keycloak Operator, you also need to port-forward the Keycloak service.

```shell
kubectl port-forward "services/$CAMUNDA_RELEASE_NAME-identity" 8085:80 --namespace "$CAMUNDA_NAMESPACE"
kubectl port-forward "services/$CAMUNDA_RELEASE_NAME-zeebe-gateway" 8080:8080 --namespace "$CAMUNDA_NAMESPACE"
# If using Keycloak Operator:
kubectl port-forward "services/keycloak-service" 18080:18080 --namespace "$CAMUNDA_NAMESPACE"
```

**Tip: Localhost development with kubefwd**
For a richer localhost experience, and to avoid managing many individual port-forward commands, use [kubefwd](https://github.com/txn2/kubefwd) to forward all Services in the target namespace and make them resolvable by their in-cluster DNS names on your workstation.

Example (requires `sudo` to bind privileged ports and modify `/etc/hosts`):

```bash
sudo kubefwd services -n "$CAMUNDA_NAMESPACE"
```

Now, you can reach services directly, for example:

- Identity: `http://$CAMUNDA_RELEASE_NAME-identity/managementidentity`
- Zeebe Gateway gRPC: `$CAMUNDA_RELEASE_NAME-zeebe-gateway:26500`

You can still use localhost ports if you prefer traditional port-forwarding. Stop kubefwd with **Ctrl+C** when finished. Be aware kubefwd modifies your `/etc/hosts` temporarily; it restores the file when it exits.

1. Open Identity in your browser at `http://localhost:8085/managementidentity`. You will be redirected to your IdP and prompted to log in.
2. Log in with the initial user `admin`. This username is defined by the `identity.firstUser.username` value in your Helm chart configuration. Retrieve the auto-generated password from the Kubernetes secret:

```shell
kubectl get secret identity-secret-for-components \
  --namespace "$CAMUNDA_NAMESPACE" \
  -o jsonpath='{.data.identity-first-user-password}' | base64 -d; echo
```

3. Select **Add application** and select **M2M** as the type. Assign a name like "test."
4. Select the newly created application. Then, select **Access to APIs > Assign permissions**, and select the **Orchestration API** with "read" and "write" permission.
5. Retrieve the `client-id` and `client-secret` values from the application details

```shell
export ZEEBE_CLIENT_ID='client-id' # retrieve the value from the identity page of your created m2m application
export ZEEBE_CLIENT_SECRET='client-secret' # retrieve the value from the identity page of your created m2m application
```

6. Open the Orchestration Cluster Admin in your browser at `http://localhost:8080/admin` and log in with the user `admin` (defined in `identity.firstUser` of the values file).
7. In the Admin navigation menu, select **Roles**.
8. Either select an existing role (for example, **Admin**) or [create a new role](https://docs.camunda.io/docs/next/components/admin/role) with the appropriate permissions for your use case.
9. In the selected role view, open the **Clients** tab and click **Assign client**.
10. Enter the client ID of your application created in Management Identity (for example, `test`) and click **Assign client** to save.

This operation links the OIDC client to the role's permissions in the Orchestration Cluster, granting the application access to the cluster resources. For more information about managing roles and clients, see [Roles](https://docs.camunda.io/docs/next/components/admin/role#manage-clients).

To access the other services and their UIs, port-forward those components as well:

```bash
kubectl port-forward "svc/$CAMUNDA_RELEASE_NAME-zeebe-gateway"  8080:8080 --namespace "$CAMUNDA_NAMESPACE"  # Orchestration
kubectl port-forward "svc/$CAMUNDA_RELEASE_NAME-optimize" 8083:80 --namespace "$CAMUNDA_NAMESPACE"  # Optimize
kubectl port-forward "svc/$CAMUNDA_RELEASE_NAME-connectors" 8086:8080 --namespace "$CAMUNDA_NAMESPACE"  # Connectors
kubectl port-forward "svc/$CAMUNDA_RELEASE_NAME-web-modeler-restapi" 8070:80 --namespace "$CAMUNDA_NAMESPACE"  # WebModeler
kubectl port-forward "svc/$CAMUNDA_RELEASE_NAME-console" 8087:80 --namespace "$CAMUNDA_NAMESPACE"  # Console
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
