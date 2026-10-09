# Deploy an AKS cluster with Terraform (advanced) — 2. Preparation for Camunda 8 installation — rdbms

The RDBMS variant manifest creates an additional `camunda_orchestration` database and user for the secondary storage:

Show manifest setup-postgres-create-db.yml

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/manifests/setup-postgres-create-db.yml
```

Once the secret is created, the **Job** manifest from the previous step can consume this secret to securely access the database credentials.

4. Once the job is created, monitor its progress using:

```bash
kubectl get job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE" --watch
```

Once the job shows as `Completed`, the users and databases will have been successfully created.

5. View the logs of the job to confirm that the users were created and privileges were granted successfully:

```bash
kubectl logs job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
```

6. Clean up the resources:

```bash
kubectl delete job create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
kubectl delete secret setup-db-secret --namespace "$CAMUNDA_NAMESPACE"
```

Running these commands cleans up both the job and the secret, ensuring that no unnecessary resources remain in the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
