# Dual-region setup (ECS Fargate) — Deployment walkthrough — Step 1 — Configure

Create a `terraform.tfvars` file in each of the three Terraform directories before running `apply`.

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
The infra layer takes the `registry_username` and `registry_password` for `registry.camunda.cloud`. Do not commit `terraform.tfvars` to source control. Add `*.tfvars` to your `.gitignore`, or supply secrets via `TF_VAR_registry_username` / `TF_VAR_registry_password` environment variables or a secrets backend such as HashiCorp Vault.

```hcl
cluster_name           = "<your-cluster-name>"   # must match vpc layer
aws_profile            = "<your-aws-profile>"    # optional; omit when authenticating via env vars
region_0               = "<primary-region>"
region_1               = "<secondary-region>"
s3_force_destroy       = true                    # default; flip to false before running real workloads — see Cleanup
limit_access_to_cidrs  = ["<your-source-cidr>"]  # required; restrict to the CIDR range that should reach the ALB
registry_username      = "<your-registry-user>"  # Camunda registry credentials for registry.camunda.cloud
registry_password      = "<your-registry-pass>"
```

#### `terraform/app/terraform.tfvars`

```hcl
aws_profile      = "<your-aws-profile>" # optional; omit when authenticating via env vars
camunda_image    = "registry.camunda.cloud/camunda/camunda:<camunda-version>"      # 8.10 or later
connectors_image = "camunda/connectors-bundle:<connectors-bundle-version>"          # for example, 8.10.0-alpha2
default_tags     = { Environment = "reference", Team = "<your-team>" }
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
