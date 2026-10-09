# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — VPN module setup

You can optionally set up an AWS VPN endpoint to access a private cluster.  
This step is only required if you configured a private cluster.

Using a VPN offers a flexible and secure way to connect to the private subnets within your VPC. It can be used either by a user to access cluster resources or to enable cross-site communications via [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html). This module focuses on user access.

<!-- The following diagram should be exported as an image and as a PDF from the sources https://miro.com/app/board/uXjVL-6SrPc=/ --->
<!-- To export: click on the frame > "Export Image" > as PDF and as JPG (low res), then save it in the ./assets/ folder --->

_Infrastructure diagram for a single region EKS setup with VPN (click on the image to open the PDF version)_
[![Infrastructure Diagram EKS Single-Region VPN](./assets/eks-single-region-vpn.jpg)](./assets/eks-single-region-vpn.pdf)

AWS VPN technology is compatible with OpenVPN clients. It uses [x509 certificates](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/mutual.html) for mutual authentication and source verification.
The encryption provided by these certificates ensures that traffic can securely transit over the internet to the AWS VPN endpoint, which performs NAT and routes the traffic directly into the private subnets. This VPN endpoint then becomes the sole access point to the private cluster.

#### Retrieve the VPC cluster ID

To create the VPN Endpoint in your cluster's VPC, you need to retrieve the VPC ID using [Terraform outputs](https://developer.hashicorp.com/terraform/language/values/outputs) from the [EKS cluster module](#eks-cluster-module-setup). Follow these steps:

1. Go to the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture) and switch into the `cluster` module directory:

   ```bash
   cd ./aws/kubernetes/eks-single-region/terraform/

   ls
   # Example output:
   # cluster vpn

   cd cluster
   ```

2. Export the [VPC ID](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) to an environment variable:

   ```bash
   export CLUSTER_VPC_ID="$(terraform output -raw vpc_id)"
   echo "CLUSTER_VPC_ID=$CLUSTER_VPC_ID"
   ```

#### Set up the VPN module

From the parent directory of your cluster module, go to the `vpn` directory which holds the VPN endpoint configuration.

This setup creates a Certificate Authority (CA) for AWS VPN to perform encryption and mutual client authentication. For simplicity, the CA and generated certificates are stored in the project’s Terraform state (`tfstate`). You may customize this as needed.

1. Review `config.tf`, which configures the S3 backend for Terraform state management:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/terraform/vpn/config.tf
   ```

2. Review `vpn.tf`, which defines the VPC Client endpoint configuration:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/terraform/vpn/vpn.tf
   ```

This VPN Client Endpoint follows [AWS best practices and constraints](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is-best-practices.html):

- Uses a client CIDR range that does not overlap with the VPC CIDR or any manually added VPN route table routes.
- Implements [split-tunnel routing](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/split-tunnel-vpn.html), so only traffic for the VPC goes through the VPN, minimizing bandwidth use.
- Supports IPv4 only and is bound to the VPC’s private subnets.

**Initialize and configure Terraform**:

1. Set your Terraform state key, initialize Terraform with the S3 [backend](#create-an-s3-bucket-for-terraform-state-management), and download necessary provider plugins:

   ```bash
   export S3_TF_BUCKET_KEY_VPN="camunda-terraform/vpn.tfstate"

   echo "Storing cluster terraform state in s3://$S3_TF_BUCKET_NAME/$S3_TF_BUCKET_KEY_VPN"

   terraform init -backend-config="bucket=$S3_TF_BUCKET_NAME" -backend-config="key=$S3_TF_BUCKET_KEY_VPN" -backend-config="region=$S3_TF_BUCKET_REGION"
   ```

   Terraform will connect to the S3 bucket to manage the state file, ensuring remote and persistent storage.

2. For each client connecting to the cluster, assign a unique name in `client_key_names` to simplify certificate revocation.

3. By default, VPN access is allowed from any IP address. Restrict access by adjusting the `vpn_allowed_cidr_blocks` variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
