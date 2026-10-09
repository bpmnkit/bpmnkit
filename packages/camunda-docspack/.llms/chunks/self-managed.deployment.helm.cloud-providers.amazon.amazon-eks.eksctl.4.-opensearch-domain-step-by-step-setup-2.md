# Deploy an EKS cluster with eksctl — 4. OpenSearch domain — Step-by-step setup (2)

**Tip**

The instance type `m7i.large.search` in the above example is a suggestion, and can be changed depending on your needs.

6. Wait for the OpenSearch domain to be active:

   ```shell
   while [ "$(aws opensearch describe-domain --domain-name $OPENSEARCH_NAME --query 'DomainStatus.Processing' --output text)" != "False" ]; do echo "Waiting for OpenSearch domain to become availablen this can up to take 20-30 minutes..."; sleep 30; done && echo "OpenSearch domain is now available\!"
   ```

7. Retrieve the endpoint of the OpenSearch domain:

   ```shell
   export OPENSEARCH_HOST=$(aws opensearch describe-domains --domain-names $OPENSEARCH_NAME --query "DomainStatusList[0].Endpoints.vpc" --output text)

   echo "OPENSEARCH_HOST=$OPENSEARCH_HOST"
   ```

   This endpoint will be used to connect to your OpenSearch domain.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
