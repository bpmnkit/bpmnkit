# Kubernetes deployment overview — Cloud specifics — Amazon EKS

#### Minimum cluster requirements

- Instance type: `m6i.xlarge` (4 vCPUs, 16 GiB memory)
- Number of Kubernetes nodes: 4
- Volume type: SSD `gp3`
  - 3,000 IOPS baseline
  - 125 MiB/s throughput baseline
  - Requires [Amazon EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html) to be installed and a `gp3` StorageClass [configured](https://docs.aws.amazon.com/eks/latest/userguide/create-storage-class.html)
- Volume alternative: `gp2`
  - Only if `gp3` isn't available
  - Performance [varies based on volume size](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html#gp2-performance); size the disk to sustain the target IOPS and throughput baseline
- Unsupported volume types: `sc1` (Cold HDD) and `st1` (Throughput HDD) are not supported.

**Caution**
`sc1` and `st1` cannot meet Zeebe's Raft protocol disk flush requirements. They use burst credits for throughput, and once credits are exhausted, write latency spikes to hundreds of milliseconds, causing persistent Raft append timeouts and leader instability.

#### Load balancer

The following AWS load balancers are supported by Camunda 8:

- Application Load Balancer (ALB)
- Network Load Balancer (NLB)

The Classic Load Balancer (CLB) is the previous generation and is not supported by Camunda 8.

##### Application Load Balancer (ALB)

AWS offers an [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) (ALB), which requires TLS termination in the load balancer and supports AWS Certificate Manager (ACM).

To use an Application Load Balancer:

- Deploy the [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- Set up a [certificate in AWS Certificate Manager](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)
- Configure Ingress for Camunda using the [AWS example](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/examples/grpc_server.md), which results in the following annotations on the Camunda Ingress:
  ```yaml
  alb.ingress.kubernetes.io/ssl-redirect: "443"
  alb.ingress.kubernetes.io/backend-protocol-version: GRPC
  alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS":443}]'
  alb.ingress.kubernetes.io/scheme: internet-facing
  alb.ingress.kubernetes.io/target-type: ip
  ```

The setup does not require configuration of [TLS on the Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls). If the AWS Load Balancer Controller is correctly configured, it automatically retrieves the appropriate certificate from ACM based on the host name.

**Note: AWS ALB known limitations**
Application Load Balancers (ALB) support HTTP/2 over HTTPS listeners and allow a maximum of 128 streams per client HTTP/2 connection. The HTTP/2 server-push feature is not supported. For details, see [AWS ALB protocols](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html#target-group-protocol-version:~:text=The%20maximum%20number%20of%20streams,client%20HTTP%2F2%20connection%20is%20128).

If you need more than 128 streams per client, see [Network Load Balancer](#network-load-balancer-nlb).

##### Network load balancer (NLB)

Camunda 8 is compatible with [Contour](https://projectcontour.io/), which deploys a Network Load Balancer. In this setup, TLS must be terminated within the Ingress, so AWS Certificate Manager (ACM) cannot be used. ACM does not allow exporting the private key required for TLS termination inside the Ingress.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
