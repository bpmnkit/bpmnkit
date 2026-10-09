# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — standard

```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/create-setup-db-secret.sh
   ```

   This command creates a secret named `setup-db-secret` and dynamically populates it with the values from your environment variables.

   After running the above command, you can verify that the secret was created successfully by using:

   ```bash
   kubectl get secret setup-db-secret -o yaml --namespace "$CAMUNDA_NAMESPACE"
   ```

   This should display the secret with the base64 encoded values.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
