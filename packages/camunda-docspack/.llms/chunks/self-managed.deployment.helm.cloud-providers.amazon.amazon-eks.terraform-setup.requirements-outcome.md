# Deploy an EKS cluster with Terraform — Requirements — Outcome

<!-- The following diagram should be exported as an image and as a PDF from the sources https://miro.com/app/board/uXjVL-6SrPc=/ --->
<!-- To export: click on the frame > "Export Image" > as PDF and as JPG (low res), then save it in the ./assets/ folder --->

_Infrastructure diagram for a single region EKS setup (click on the image to open the PDF version)_
[![Infrastructure Diagram EKS Single-Region](./assets/eks-single-region.jpg)](./assets/eks-single-region.pdf)

After completing this guide, you will have:

- An Amazon EKS Kubernetes cluster running with four nodes ready for Camunda 8 installation.
- The [EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html), installed and configured. This is used by the Camunda 8 Helm chart to create [persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
- (Optional) A managed [Aurora PostgreSQL](https://aws.amazon.com/rds/postgresql/) instance for Camunda.
- (Optional) A managed [Amazon OpenSearch Service](https://aws.amazon.com/opensearch-service/) domain created and configured for use with Camunda. The RDBMS variant uses Amazon Aurora PostgreSQL as secondary storage and does not create this domain.
- (Optional) [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) configured so Kubernetes workloads can assume IAM roles without stored credentials.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
