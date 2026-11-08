# Dual-region ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — OpenShift clusters module setup (3)

1. Configure user access to the clusters. By default, the user who creates an OpenShift cluster has administrative access. If you want to grant access to other users, follow the [Red Hat documentation for granting admin rights to users](https://docs.openshift.com/rosa/cloud_experts_tutorials/cloud-experts-getting-started/cloud-experts-getting-started-admin-rights.html) when the cluster will be created.

1. Customize the clusters setup. The module offers various input options that allow you to further customize the cluster configuration. For a comprehensive list of available options and detailed usage instructions, refer to the [ROSA module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/rosa-hcp/README.md).

**Caution: Camunda Terraform module**

This ROSA module is based on the [official Red Hat Terraform module for ROSA HCP](https://registry.terraform.io/modules/terraform-redhat/rosa-hcp/rhcs/latest). Please be aware of potential differences and choices in implementation between this module and the official one.

Consult the [Camunda ROSA module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/rosa-hcp/README.md) for more information.

#### Define outputs

**Terraform** allows you to define outputs, which make it easier to retrieve important values generated during execution, such as cluster endpoints and other necessary configurations for Helm setup.

Each module that you have previously set up contains an output definition at the end of the file. You can adjust them to your needs.

#### Execution

1.  Plan the configuration files:

    ```bash
    # describes what will be created
    terraform plan -out clusters.plan \
        -var cluster_0_region="$CLUSTER_0_REGION" \
        -var cluster_1_region="$CLUSTER_1_REGION"
    ```

1.  After reviewing the plan, you can confirm and apply the changes.

    ```bash
    # creates the resources
    terraform apply clusters.plan
    ```

    Terraform will now create the OpenShift clusters with all the necessary configurations.
    The completion of this process may require approximately 20-30 minutes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
