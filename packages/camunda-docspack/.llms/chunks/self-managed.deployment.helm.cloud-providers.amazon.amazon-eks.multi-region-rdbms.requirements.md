# Multi-region setup with RDBMS (EKS) — Requirements

- **AWS account**: required to create AWS resources in every target region. See [What is an AWS account?](https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html).
- **AWS CLI**: command-line tool to manage AWS resources. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- **Terraform**: IaC tool to provision resources. [Install Terraform](https://developer.hashicorp.com/terraform/downloads).
- **kubectl**: CLI to interact with Kubernetes clusters. [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).
- **Helm**: package manager for Kubernetes. [Install Helm](https://helm.sh/docs/intro/install/).
- **jq**: lightweight JSON processor. [Download jq](https://jqlang.github.io/jq/download/).
- **subctl**: Submariner CLI. The reference architecture installs it for you.

For the tool versions used in testing, see the repository's [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file.

### AWS service quotas

Verify your quotas in **every** region before deploying, and request increases where needed:

- **Elastic IPs**: at least three per region, one per availability zone.
- **VPCs, EC2 instances, and EBS storage**: enough for one EKS cluster per region.
- **Transit Gateways**: one per region, plus one peering attachment per region pair.
- **Aurora Global Database**: available in the regions you choose for the database. Aurora Global Database is not offered in every region.

Some AWS regions are **opt-in** and must be enabled on the account before anything can be created in them. `eu-central-2` (Zurich), used as the third region in this guide, is one of them:

```bash
aws account enable-region --region-name eu-central-2
```

### Considerations

- **This is a multi-region deployment, and costs scale with the region count.** You pay for three EKS control planes and node groups. You also pay for three Transit Gateways with a full peering mesh, billed per attachment-hour. An Aurora Global Database adds a member per database region. AWS bills inter-region data transfer per gigabyte. Destroy the environment when you are done evaluating.
- **Non-overlapping CIDRs are mandatory.** Transit Gateway cannot route duplicate prefixes, and Submariner runs without Globalnet, so every CIDR must identify exactly one cluster.
- **Round-trip time between regions matters.** Keep it at or below 100 ms. The regions used in this guide are London, Paris, and Zurich, whose pairwise round-trip times are well inside that budget.
- **Management Identity, Web Modeler, Console, and Optimize are not part of this deployment.** See [limitations](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms#limitations).
- **This guide is a blueprint, not a production deployment.** It shows the moving parts and how they fit together. Adapt sizing, security, and traffic routing to your environment.

### Outcome

Following this guide gives you:

- Three EKS clusters, one per region, each with its own VPC and a dedicated non-overlapping CIDR.
- A Transit Gateway per region, peered in a full mesh, routing every VPC and Kubernetes service range between regions.
- Submariner service discovery, publishing each region's Zeebe service as `<clusterID>.<service>.<namespace>.svc.clusterset.local`.
- An Aurora Global Database with a writer in one region and readers in the others, reached through a single JDBC URL.
- One Orchestration Cluster that starts on two regions and grows to three. At the end, it has six brokers, six partitions, and a replication factor of five. Each database region holds two replicas of every partition, and the third region holds one.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
