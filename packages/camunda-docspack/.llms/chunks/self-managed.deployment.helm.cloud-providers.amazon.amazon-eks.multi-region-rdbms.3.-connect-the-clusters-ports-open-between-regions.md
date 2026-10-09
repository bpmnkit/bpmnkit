# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters — Ports open between regions

The security group rules are declared explicitly in [security.tf](https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/terraform/clusters/security.tf) rather than allowing all traffic between VPCs:

| Port          | Protocol | Purpose                                                             |
| :------------ | :------- | :------------------------------------------------------------------ |
| 26500 - 26502 | TCP      | Zeebe gateway gRPC, command API, and the internal API carrying Raft |
| 8080          | TCP      | Orchestration Cluster REST API                                      |
| 53            | TCP/UDP  | CoreDNS and Submariner service discovery                            |
| n/a           | ICMP     | Cross-region connectivity diagnostics                               |

Terraform creates each rule once per remote VPC range and once per remote service range. The rule count therefore grows linearly with the region count: 20 inbound rules at three regions and 30 at four. The AWS limit is 60 per security group. Terraform asserts that budget at plan time rather than letting the apply fail after the clusters exist.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
