# Amazon EC2 — 2. Deploy Camunda 8 — Connect and use Camunda 8

The Application Load Balancer (ALB) and Network Load Balancer (NLB) endpoints are available via Terraform outputs:

- `terraform output alb_endpoint`: Use this to access Operate and other Web UIs (such as Tasklist, Optimize, and Connectors). The ALB handles HTTP traffic for these interfaces, as well as the Orchestration Cluster REST API (e.g., connectors on port `9090`).

- `terraform output nlb_endpoint`: Use this to access the Zeebe Gateway’s gRPC endpoint. The NLB is designed for TCP-based gRPC traffic, while the ALB handles HTTP.

These endpoints use AWS-assigned public hostnames. To use your own domain, create CNAME records pointing to these hostnames or use [Route 53](https://aws.amazon.com/route53/) for DNS management and to enable SSL certificates. Note that enabling SSL and custom domains will require additional configuration in the Terraform blueprint, since it listens on HTTP by default.

If you prefer not to expose your environment publicly, you can use the Bastion host (jump host) to access services locally via port forwarding.

For a more secure, enterprise-grade solution, use the [AWS Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html) to access the private subnet within your VPC. This setup requires additional certificates and configuration, detailed in the [AWS getting started tutorial](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html).

The following commands can be run from within the Terraform folder to bind remote ports to your local machine via SSH port forwarding:

```sh
export BASTION_HOST=$(terraform output -raw bastion_ip)
# retrieves the first IP from the camunda_ips array
export CAMUNDA_IP=$(tf output -json camunda_ips | jq -r '.[0]')

# 26500 - gRPC; 8080 - WebUI; 9090 - Connectors
ssh -L 26500:${CAMUNDA_IP}:26500 -L 8080:${CAMUNDA_IP}:8080 -L 9090:${CAMUNDA_IP}:9090 admin@${BASTION_HOST}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
