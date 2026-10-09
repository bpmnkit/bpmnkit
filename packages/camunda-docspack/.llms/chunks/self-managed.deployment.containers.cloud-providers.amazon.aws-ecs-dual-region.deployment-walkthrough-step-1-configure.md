# Dual-region setup (ECS Fargate) — Deployment walkthrough — Step 1 — Configure

Set the Terraform state backend once, from `aws/containers/ecs-dual-region-fargate`, in the shell you use for the following steps. The infra and app layers read the `TF_VAR_terraform_backend_*` variables, and `terraform init` reads `backend.hcl` in every layer:

```bash
export TF_VAR_terraform_backend_bucket="<your-tf-state-bucket>"
export TF_VAR_terraform_backend_region="<tf-state-bucket-region>" # defaults to eu-central-1
export TF_VAR_terraform_backend_key_prefix="<your-key-prefix>/"   # same prefix for all three layers

cat > backend.hcl <<EOF
bucket = "${TF_VAR_terraform_backend_bucket}"
region = "${TF_VAR_terraform_backend_region}"
EOF
```

Then create a `terraform.tfvars` file in each of the three Terraform directories.

#### `terraform/vpc/terraform.tfvars`

Required variables for a greenfield deployment:

```hcl
cluster_name       = "<your-cluster-name>"
aws_profile        = "<your-aws-profile>" # optional; omit when authenticating via AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
region_0           = "<primary-region>"         # for example, eu-west-2
region_1           = "<secondary-region>"       # for example, eu-west-3
networking_mode    = "vpc_peering"              # default; set to "transit_gateway" only for Enterprise scenarios
region_0_cidr      = "10.192.0.0/16"
region_1_cidr      = "10.202.0.0/16"
single_nat_gateway = false                      # set to true to reduce NAT costs in non-production
```

For BYO-VPC, add:

```hcl
byo_vpc = true

region_0_vpc_id                  = "vpc-<your-vpc-id>"
region_0_vpc_cidr                = "<your-vpc-CIDR>"
region_0_private_subnet_ids      = ["subnet-aaa", "subnet-bbb", "subnet-ccc"]
region_0_public_subnet_ids       = ["subnet-ddd", "subnet-eee", "subnet-fff"]
region_0_private_route_table_ids = ["rtb-xxx"]

region_1_vpc_id                  = "vpc-<your-vpc-id>"
region_1_vpc_cidr                = "<your-vpc-CIDR>"
region_1_private_subnet_ids      = ["subnet-ggg", "subnet-hhh", "subnet-iii"]
region_1_public_subnet_ids       = ["subnet-jjj", "subnet-kkk", "subnet-lll"]
region_1_private_route_table_ids = ["rtb-yyy"]
```

#### `terraform/infra/terraform.tfvars`

**Warning**
If you pull the Camunda image from `registry.camunda.cloud`, the infra layer takes your `registry_username` and `registry_password`. Do not commit `terraform.tfvars` to source control. Add `*.tfvars` to your `.gitignore`, or supply secrets via `TF_VAR_registry_username` / `TF_VAR_registry_password` environment variables or a secrets backend such as HashiCorp Vault.

```hcl
cluster_name                 = "<your-cluster-name>"   # must match vpc layer
aws_profile                  = "<your-aws-profile>"    # optional; omit when authenticating via env vars
region_0                     = "<primary-region>"
region_1                     = "<secondary-region>"
db_engine                    = "postgresql"            # default; see Secondary storage engine
s3_force_destroy             = true                    # default; flip to false before running real workloads (see Cleanup)
limit_access_to_cidrs        = ["<your-source-cidr>"]  # defaults to 0.0.0.0/0; restrict to the CIDR range that should reach the load balancers
registry_username            = "<your-registry-user>"  # optional; only needed for images from registry.camunda.cloud
registry_password            = "<your-registry-pass>"
```

#### `terraform/app/terraform.tfvars`

```hcl
aws_profile                  = "<your-aws-profile>" # optional; omit when authenticating via env vars
region_0                     = "<primary-region>"   # must match the vpc and infra layers
region_1                     = "<secondary-region>"
camunda_image                = "registry.camunda.cloud/camunda/camunda:<camunda-version>" # 8.10 or later
connectors_image             = "camunda/connectors-bundle:<connectors-bundle-version>"     # pulled from Docker Hub without registry credentials
default_tags                 = { Environment = "reference", Team = "<your-team>" }
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
