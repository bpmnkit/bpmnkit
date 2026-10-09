# Dual-region setup (EKS) — Requirements — Outcome

<!-- The following diagram should be exported as an image and as a PDF from the sources https://miro.com/app/board/uXjVL-6SrPc=/ --->
<!-- To export: click on the frame > "Export Image" > as PDF and as JPG (low res), then save it in the ./assets/ folder --->

_Infrastructure diagram for a dual-region EKS setup (click on the image to open the PDF version)_
[![Infrastructure Diagram EKS Dual-Region](./assets/eks-dual-region.jpg)](./assets/eks-dual-region.pdf)

After completing this guide, you will have:

- Two Amazon EKS Kubernetes clusters in two different geographic regions with each four nodes ready for the Camunda 8 dual-region installation.
- The [EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html) installed and configured, which is used by the Camunda 8 Helm chart to create [persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
- A [VPC peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) between the two EKS clusters, allowing cross-cluster communication between different regions.
- An [Amazon Simple Storage Service](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) (S3) bucket for [Elasticsearch backups](https://www.elastic.co/guide/en/elasticsearch/reference/current/repository-s3.html).
- The [Elastic Cloud on Kubernetes (ECK) operator](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-overview.html) installed in both clusters for managing Elasticsearch lifecycle.
- ECK-managed Elasticsearch clusters running in both regions.

**Note**
This guide uses the ECK operator as the preferred approach for managing Elasticsearch. You are not limited to this approach; you can use managed Elasticsearch services or other Elasticsearch instances. If you choose an alternative, you are responsible for adapting the scripts and configuration accordingly.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
