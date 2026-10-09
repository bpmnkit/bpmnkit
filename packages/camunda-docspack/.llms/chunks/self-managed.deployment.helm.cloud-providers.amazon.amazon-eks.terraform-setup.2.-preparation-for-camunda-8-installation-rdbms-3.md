# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — rdbms

The RDBMS variant also creates the `camunda_orchestration` database used as secondary storage for the Orchestration Cluster.

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-rdbms/setup-postgres-create-db.yml
   ```

   
   

4. Apply the manifest:

   ```bash
   kubectl apply -f setup-postgres-create-db.yml --namespace "$CAMUNDA_NAMESPACE"
   ```

   Once the secret is created, the **Job** manifest from the previous step can consume this secret to securely access the database credentials.

5. Once the job is created, monitor its progress using:

   ```bash
   kubectl get job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE" --watch
   ```

   Once the job shows as `Completed`, the users and databases will have been successfully created.

6. View the logs of the job to confirm that the users were created and privileges were granted successfully:

   ```bash
   kubectl logs job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
   ```

7. Clean up the resources:

   ```bash
   kubectl delete job create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
   kubectl delete secret setup-db-secret --namespace "$CAMUNDA_NAMESPACE"
   ```

Running these commands cleans up both the job and the secret, ensuring that no unnecessary resources remain in the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
