# Deploy an AKS cluster with Terraform (advanced) — Requirements — Outcome

_Infrastructure diagram for a single-region AKS setup (click on the image to open the PDF version)_
[![Infrastructure Diagram AKS Single-Region](./assets/aks-single-region.jpg)](./assets/aks-single-region.pdf)

**Note**

The vnet and the subnets are sized according to standard Azure recommendations by default.
Due to Azure CNI, every pod will get assigned a real internal IP. While the defaults are more than sufficient for this guide, if you expect a large number of pods in a single subnet, consider using a larger subnet for AKS like /23 or /22.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
