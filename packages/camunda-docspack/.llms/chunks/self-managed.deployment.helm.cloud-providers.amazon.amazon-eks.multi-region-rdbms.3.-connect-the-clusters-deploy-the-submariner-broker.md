# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters — Deploy the Submariner broker

Deploy the ClusterSet broker into one region. It stores ClusterSet metadata only, so any cluster can host it and its loss does not interrupt anything already established.

```bash
./submariner/deploy-broker.sh
```

See the deploy-broker.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/deploy-broker.sh
```

Submariner is deployed with its **service-discovery component only**. It provides multi-cluster DNS and nothing else: no gateway nodes, no IPsec tunnel, no route agent. `subctl show connections` is empty by design.

Why there is no encrypted overlay

Running Submariner's connectivity component alongside the AWS VPC CNI puts two owners on the same prefixes. Submariner installs node routes for every remote cluster CIDR so it can pull that traffic into its tunnel. With the VPC CNI those CIDRs are the VPC ranges, which the Transit Gateway also routes, including the node addresses the tunnels are built on. The result is tunnels that report `connected`, cross-cluster DNS that resolves correctly, and Raft messages that are silently dropped.

Removing one of the two owners removes the whole class of problem. You cannot remove the Transit Gateway, so remove the other owner.

The traffic is still encrypted. AWS encrypts inter-region Transit Gateway peering itself. AES-256 protects the traffic at the virtual network layer as it travels between regions. AWS encrypts it again at the physical layer, on links outside its physical control. See [transit gateway peering attachments](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-peering.html) and [encryption in transit](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/data-protection.html#encryption-transit).

You give up control of the encryption. The keys are AWS-managed. If a control requires customer-managed keys, enable TLS in the workload, or replace the VPC CNI with Cilium in ENI mode plus WireGuard or IPsec. In ENI mode pod addresses stay ordinary VPC addresses, so the Transit Gateway remains the only owner of the routes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
