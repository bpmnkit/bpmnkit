# Install Camunda 8 on an EKS cluster — Verify connectivity to Camunda 8 — with

1. Open Identity in your browser at `https://${CAMUNDA_DOMAIN}/managementidentity`. You will be redirected to your IdP and prompted to log in.
2. Log in with the initial user `admin` (defined in `identity.firstUser` of the values file). Retrieve the generated password (created earlier when running the secret creation script) from the Kubernetes secret and use it to authenticate:

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

6. Open the Orchestration Cluster Admin in your browser at `https://${CAMUNDA_DOMAIN}/admin` and log in with the user `admin` (defined in `identity.firstUser` of the values file).
7. In the Admin navigation menu, select **Roles**.
8. Either select an existing role (for example, **Admin**) or [create a new role](https://docs.camunda.io/docs/next/components/admin/role) with the appropriate permissions for your use case.
9. In the selected role view, open the **Clients** tab and click **Assign client**.
10. Enter the client ID of your application created in Management Identity (for example, `test`) and click **Assign client** to save.

This operation links the OIDC client to the role's permissions in the Orchestration Cluster, granting the application access to the cluster resources. For more information about managing roles and clients, see [Roles](https://docs.camunda.io/docs/next/components/admin/role#manage-clients).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
