# Deploy an AKS cluster with Terraform (advanced) — 2. Preparation for Camunda 8 installation — rdbms

The RDBMS variant includes additional orchestration database credentials in the secret:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/procedure/create-setup-db-secret.sh
```

This command creates a secret named `setup-db-secret` and dynamically populates it with the values from your environment variables.

After running the above command, you can verify that the secret was created successfully by using:

```bash
kubectl get secret setup-db-secret -o yaml --namespace "$CAMUNDA_NAMESPACE"
```

This should display the secret with the base64 encoded values.

3. Apply the following manifest to set up the DB:

```bash
kubectl apply -f ./manifests/setup-postgres-create-db.yml --namespace "$CAMUNDA_NAMESPACE"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
