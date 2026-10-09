# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — Terraform setup

This reference architecture uses [Terraform modules](https://developer.hashicorp.com/terraform/language/modules) to deploy all required Azure infrastructure for running Camunda 8 in a production-grade AKS environment. It includes:

- A Virtual Network (VNet) and three subnets (AKS, database, private endpoint)
- Network Security Group (NSG) for AKS
- Azure Kubernetes Service (AKS) cluster with system and user node pools across 3 AZs
- Azure PostgreSQL Flexible Server with high availability and private endpoint
- Azure Key Vault with encryption key and a user-assigned managed identity for AKS secrets (KMS)

#### 1. Main configuration

The main deployment logic is defined in [`main.tf`](https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/main.tf). It instantiates all modules and exposes several **customizable values** via the `locals` block:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/main.tf
```

**Warning: Azure Key Vault naming**

Azure Key Vault names must be **globally unique** across all Azure subscriptions. In the linked script, you are prompted to provide a resource prefix, and the Key Vault will be created as `resource_prefix-kv`. Be sure to choose a prefix that results in a unique Key Vault name, or override it in the KMS module to avoid deployment failures.

The modules deployed are:

- `network` ([network.tf](https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/network.tf)): Virtual network, AKS subnet, DB subnet, and private endpoint subnet
- `kms` ([kms.tf](https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/kms.tf)): Key Vault, encryption key, and UAMI for AKS secret encryption
- `aks` ([aks.tf](https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/aks.tf)): Cluster deployment with system and user node pools across AZs
- `postgres_db` ([db.tf](https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/db.tf)): High-availability PostgreSQL Flexible Server, private DNS, and endpoint

#### 2. AKS module

This module exposes a customizable **kubernetes_version** value via the `locals` block:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/aks.tf#L1-L3
```

#### 3. PostgreSQL module

This module exposes several **customizable values** via the `locals` block:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
