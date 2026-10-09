# Deploy an EKS cluster with eksctl — 2. EKS cluster — Create the cluster using eksctl

Execute the following script, which creates a file called `cluster.yaml` with the following contents:

```shell
cat <<EOF >./cluster.yaml
---
apiVersion: eksctl.io/v1alpha5
metadata:
  name: ${CLUSTER_NAME:-camunda-cluster} # e.g. camunda-cluster
  region: ${REGION:-eu-central-1} # e.g. eu-central-1
  version: "1.33"
availabilityZones:
  - ${REGION:-eu-central-1}c # e.g. eu-central-1c, the minimal is two distinct Availability Zones (AZs) within the region
  - ${REGION:-eu-central-1}b
  - ${REGION:-eu-central-1}a
cloudWatch:
  clusterLogging: {}
iam:
  vpcResourceControllerPolicy: true
addons:
  - name: vpc-cni
    resolveConflicts: overwrite
    version: latest
    useDefaultPodIdentityAssociations: true

  - name: kube-proxy
    resolveConflicts: overwrite
    version: latest
    useDefaultPodIdentityAssociations: true

  - name: aws-ebs-csi-driver
    resolveConflicts: overwrite
    version: latest
    useDefaultPodIdentityAssociations: true

  - name: coredns
    resolveConflicts: overwrite
    version: latest
    useDefaultPodIdentityAssociations: true

  - name: eks-pod-identity-agent
    version: latest

kind: ClusterConfig
kubernetesNetworkConfig:
  ipFamily: IPv4
managedNodeGroups:
  - amiFamily: AmazonLinux2023
    desiredCapacity: ${NODE_COUNT:-4} # number of default nodes spawned if no cluster autoscaler is used
    disableIMDSv1: true
    iam:
      withAddonPolicies:
        albIngress: true
        autoScaler: true
        cloudWatch: true
        ebs: true
        awsLoadBalancerController: true
    instanceSelector: {}
    instanceTypes:
      - ${NODE_TYPE:-m6i.xlarge} # node type that is selected as default
    labels:
      alpha.eksctl.io/cluster-name: ${CLUSTER_NAME:-camunda-cluster} # e.g. camunda-cluster
      alpha.eksctl.io/nodegroup-name: services
    maxSize: 10 # maximum node pool size for cluster autoscaler
    minSize: 1 # minimum node pool size for cluster autoscaler
    name: services
    privateNetworking: true
    releaseVersion: ""
    securityGroups:
      withLocal: null
      withShared: null
    ssh:
      allow: false
      publicKeyPath: ""
    tags:
      alpha.eksctl.io/nodegroup-name: services
      alpha.eksctl.io/nodegroup-type: managed
    volumeIOPS: 3000
    volumeSize: 80
    volumeThroughput: 125
    volumeType: gp3
privateCluster:
  enabled: false
  skipEndpointCreation: false
vpc:
  autoAllocateIPv6: false
  cidr: ${CIDR:-10.192.0.0/16}
  clusterEndpoints:
    privateAccess: false
    publicAccess: true
  manageSharedNodeSecurityGroupRules: true
  nat:
    gateway: HighlyAvailable
secretsEncryption:
  keyARN: ${KMS_ARN}
autoModeConfig:
  enabled: false
EOF
```

With eksctl you can execute the previously created file as follows and takes 25-30 minutes.

```shell
cat cluster.yaml

eksctl create cluster --config-file cluster.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
