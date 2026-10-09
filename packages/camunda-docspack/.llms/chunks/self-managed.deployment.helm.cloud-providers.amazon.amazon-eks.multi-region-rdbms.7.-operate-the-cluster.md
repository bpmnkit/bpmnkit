# Multi-region setup with RDBMS (EKS) — 7. Operate the cluster

Day-2 procedures, including region loss, failback, and adding a region, are documented separately in the [Multi-Region RDBMS operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops).


## Troubleshooting

### Cross-region pod traffic is dropped

Prove the substrate before investigating Camunda:

```bash
./verify-cross-region-connectivity.sh
```

Submariner does not carry this traffic, so do not start with `subctl`. The data plane is the Transit Gateway. Check that the remote ranges are routed, expecting one route per remote VPC and service CIDR:

```bash
aws ec2 describe-route-tables --region eu-west-2 \
  --filters "Name=vpc-id,Values=<vpc-id>" \
  --query 'RouteTables[].Routes[?TransitGatewayId!=null].[DestinationCidrBlock]' --output text
```

Then check that the remote security group allows the port:

```bash
aws ec2 describe-security-group-rules --region eu-west-3 \
  --filters "Name=group-id,Values=<security-group-id>" \
  --query 'SecurityGroupRules[?!IsEgress].[CidrIpv4,IpProtocol,FromPort,ToPort]' --output text
```

### Names do not resolve across regions

If routing is correct but names do not resolve, the problem is service discovery:

```bash
subctl show networks --contexts cluster-london
kubectl --context cluster-london -n submariner-operator get clusters.submariner.io
kubectl --context cluster-london -n camunda get serviceexports,serviceimports
```

A full diagnostic dump, including cross-cluster name resolution, is available:

```bash
./submariner/diagnose-submariner.sh
```

See the diagnose-submariner.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/diagnose-submariner.sh
```

### Zeebe never reaches the expected broker count

This is almost always cross-region DNS. Check the service discovery layer first, then the broker's startup gate:

```bash
./submariner/verify-submariner.sh
kubectl --context cluster-london -n camunda logs camunda-zeebe-0 -c wait-clusterset-dns
```

If brokers are `Pending` rather than `Running`, the storage class is missing in that region. See [configure the storage class](#configure-the-storage-class).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
