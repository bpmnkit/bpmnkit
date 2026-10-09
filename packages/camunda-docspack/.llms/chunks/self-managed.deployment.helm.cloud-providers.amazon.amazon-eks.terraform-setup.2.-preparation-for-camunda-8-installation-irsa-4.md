# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — irsa

1. In your terminal, set the necessary environment variables that will be substituted in the setup manifest:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/procedure/vars-create-os.sh
   ```

   A **Kubernetes job** will connect to the OpenSearch dommain and configure it.

1. Create a secret that references the environment variables:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/procedure/create-setup-os-secret.sh
   ```

   This command creates a secret named `setup-os-secret` and dynamically populates it with the values from your environment variables.

   After running the above command, you can verify that the secret was created successfully by using:

   ```bash
   kubectl get secret setup-os-secret -o yaml --namespace "$CAMUNDA_NAMESPACE"
   ```

   This should display the secret with the base64 encoded values.

1. Save the following manifest to a file, for example, `setup-opensearch-fgac.yml`.

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/setup-opensearch-fgac.yml
   ```

1. Apply the manifest:

   ```bash
   kubectl apply -f setup-opensearch-fgac.yml --namespace "$CAMUNDA_NAMESPACE"
   ```

   Once the secret is created, the **Job** manifest from the previous step can consume this secret to securely access the OpenSearch domain credentials.

1. Once the job is created, monitor its progress using:

   ```bash
   kubectl get job/setup-opensearch-fgac --namespace "$CAMUNDA_NAMESPACE" --watch
   ```

   Once the job shows as `Completed`, the OpenSearch domain is configured correctly for fine grained access control.

1. View the logs of the job to confirm that the privileges were granted successfully:

   ```bash
   kubectl logs job/setup-opensearch-fgac --namespace "$CAMUNDA_NAMESPACE"
   ```

1. Clean up the resources:

   ```bash
   kubectl delete job setup-opensearch-fgac --namespace "$CAMUNDA_NAMESPACE"
   kubectl delete secret setup-os-secret --namespace "$CAMUNDA_NAMESPACE"
   ```

Running these commands will clean up both the job and the secret, ensuring that no unnecessary resources remain in the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
