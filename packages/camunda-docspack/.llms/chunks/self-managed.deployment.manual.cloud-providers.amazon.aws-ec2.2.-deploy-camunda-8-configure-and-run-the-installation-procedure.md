# Amazon EC2 — 2. Deploy Camunda 8 — Configure and run the installation procedure

1. Navigate to the procedure directory:

```sh
cd procedure
```

The `procedure` directory contains Bash scripts for installing and configuring Camunda 8.

2. Configure script behavior using the following environment variables:
   - `CLOUDWATCH_ENABLED`: Defaults to `false`. Set to `true` to install the CloudWatch agent on each EC2 instance and export Camunda logs and Prometheus metrics to AWS CloudWatch.
   - `CAMUNDA_DISTRO_USER`: Camunda Enterprise LDAP username for authenticating against `artifacts.camunda.com` (Artifactory). Required to download artifacts from `artifacts.camunda.com`.
   - `CAMUNDA_DISTRO_PASSWORD`: Camunda Enterprise LDAP password for authenticating against `artifacts.camunda.com` (Artifactory). Required to download artifacts from `artifacts.camunda.com`.

3. Override default versions in the `camunda-install.sh` script by modifying these variables:
   - `OPENJDK_VERSION`: The Temurin Java version to install.
   - `CAMUNDA_VERSION`: The Camunda 8 version to install.
   - `CAMUNDA_CONNECTORS_VERSION`: The Camunda 8 Connectors version to install.

**Note**
   These variables must be set inside the `camunda-install.sh` script itself; they cannot be set as environment variables.

4. Run the `all-in-one-install.sh` script.

This script installs all required dependencies and configures Camunda 8 to run in a highly available setup using a managed OpenSearch instance.

It automatically retrieves all required IP addresses and other details from the Terraform state via Terraform outputs.

During the initial run, you will be prompted to confirm SSH connections to each EC2 instance by typing `yes`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
