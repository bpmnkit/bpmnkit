# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Access to the private network using the VPN

This section applies if you have previously created a private cluster and want to access it using the [VPN module configured earlier](#vpn-module-setup).

1. Navigate to the VPN module directory (`vpn`):

   ```bash
   pwd

   # Example output:
   # ./camunda-deployment-references/aws/kubernetes/eks-single-region(-irsa)/terraform/vpn/
   ```

2. Generate your client’s VPN configuration file. This file is compatible with [OpenVPN (ovpn)](https://openvpn.net/) format:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/vpn/gather-vpn-config.sh
   ```

3. Import the generated configuration file (`my-client.ovpn`) into an OpenVPN client:
   - _(preferred)_ [Official AWS VPN Client](https://docs.aws.amazon.com/vpn/latest/clientvpn-user/connect-aws-client-vpn-connect.html)
   - [Other OpenVPN Clients](https://docs.aws.amazon.com/vpn/latest/clientvpn-user/connect.html)

4. Once the VPN client is connected, you will have secure access to the VPC’s private network.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
