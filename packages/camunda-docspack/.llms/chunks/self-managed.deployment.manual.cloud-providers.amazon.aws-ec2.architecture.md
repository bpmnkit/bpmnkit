# Amazon EC2 — Architecture

The architecture outlined below describes a standard three-node deployment, distributed across three [availability zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) within a single AWS region. It includes a managed OpenSearch domain deployed under the same conditions. This approach ensures high availability and redundancy in case of a zone failure.

<!-- The following diagram should be exported as an image and as a PDF from the sources https://miro.com/app/board/uXjVL-6SrPc=/ -->
<!-- To export: click on the frame > "Export Image" > as PDF and as JPG (low res), then save it in the ./assets/ folder -->

_Infrastructure diagram for a 3-node EC2 architecture (click the image to view the PDF version)_

[![AWS EC2 Architecture](./assets/aws-ec2-arch.jpg)](./assets/aws-ec2-arch.pdf)

The setup includes:

- A [Virtual Private Cloud](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) (VPC), which is a logically isolated virtual network.
  - A [Private Subnet](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html), which does not have direct internet access.
    - Three [EC2](https://aws.amazon.com/ec2/) instances running Ubuntu—one in each availability zone—host the Camunda 8 components.
    - A [managed OpenSearch](https://aws.amazon.com/what-is/opensearch/) cluster, also distributed across the three zones.
  - A [Public Subnet](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html), which has internet access via an [Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html).
    - (Optional) An [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) (ALB) to expose web interfaces such as Operate, Tasklist, Connectors, and the Orchestration Cluster REST API. This uses sticky sessions, as requests are otherwise distributed round-robin across EC2 instances.
    - (Optional) A [Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) (NLB) to expose the gRPC endpoint of the Zeebe Gateway, if external applications need to connect.
    - (Optional) A [Bastion Host](https://en.wikipedia.org/wiki/Bastion_host) to allow access to private EC2 instances that are not publicly exposed.
      - Alternatively, use [AWS Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html) to access the private subnet. This setup requires additional effort and certificates but can be implemented using [AWS’s getting started guide](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html).
    - A [NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) that allows private EC2 instances to access the internet for downloading and updating software packages. Note that this does **not** provide inbound access to the instances.
- [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) to control network traffic to and from the EC2 instances.
- An [Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) to route traffic between the VPC and the internet.

Both subnet types are distributed across three availability zones in a single AWS region, supporting a high-availability architecture.

**Note: Single deployment**
You can also run this setup using a single AWS EC2 instance. However, in the event of a zone failure, the entire environment would become unreachable.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
