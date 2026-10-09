# Deploy an EKS cluster with eksctl — 4. OpenSearch domain — Step-by-step setup

1. Identify the VPC associated with the Amazon EKS cluster:

   ```shell
   export VPC_ID=$(aws ec2 describe-vpcs \
     --query "Vpcs[?Tags[?Key=='alpha.eksctl.io/cluster-name']|[?Value=='$CLUSTER_NAME']].VpcId" \
     --output text)

   echo "VPC_ID=$VPC_ID"
   ```

   The variable `VPC_ID` contains the output value required for the next steps (the value should look like this: `vpc-1234567890`).

2. Create a security group within the VPC to allow connections to the OpenSearch domain:

   ```shell
   export GROUP_ID_OPENSEARCH=$(aws ec2 create-security-group \
     --group-name opensearch-sg \
     --description "Security Group to allow internal connections From EKS $CLUSTER_NAME to OpenSearch $OPENSEARCH_NAME" \
     --vpc-id $VPC_ID \
     --query 'GroupId' \
     --output text)

   echo "GROUP_ID_OPENSEARCH=$GROUP_ID_OPENSEARCH"
   ```

   The variable `GROUP_ID_OPENSEARCH` contains the output (the value should look like this: `sg-1234567890`).

3. Create a security Ingress rule to allow access to OpenSearch over HTTPS (port 443) from within the VPC:

   ```shell
   aws ec2 authorize-security-group-ingress \
     --group-id $GROUP_ID_OPENSEARCH \
     --protocol tcp \
     --port 443 \
     --cidr $CIDR
   ```

   Ensure that the CIDR range is appropriate for your environment. OpenSearch uses `443` as the https transport port.

4. Retrieve the private subnets of the VPC:

   ```shell
   export SUBNET_IDS=$(aws ec2 describe-subnets \
     --filter Name=vpc-id,Values=$VPC_ID \
     --query "Subnets[?Tags[?Key=='aws:cloudformation:logical-id']|[?contains(Value, 'Private')]].SubnetId" \
     --output text | expand -t 1)

   # format it with coma
   export SUBNET_IDS=$(echo "$SUBNET_IDS" | sed 's/ /,/g')

   echo "SUBNET_IDS=$SUBNET_IDS"
   ```

   The variable `SUBNET_IDS` now contains the output values of the private subnets (the value should look like this: `subnet-0123456789 subnet-1234567890`).

5. Create the OpenSearch domain:

   ```shell
   aws opensearch create-domain --domain-name $OPENSEARCH_NAME \
     --engine-version OpenSearch_2.19 \
     --cluster-config  "InstanceType=m7i.large.search,InstanceCount=3,ZoneAwarenessEnabled=true,ZoneAwarenessConfig={AvailabilityZoneCount=3}" \
     --node-to-node-encryption-options Enabled=true \
     --ebs-options "EBSEnabled=true,VolumeType=gp3,VolumeSize=50,Iops=3000,Throughput=125" \
     --encryption-at-rest-options Enabled=true \
     --access-policies "{ \"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\", \"Principal\": { \"AWS\": \"*\" }, \"Action\": \"es:*\", \"Resource\": \"arn:aws:es:$REGION:*:domain/$OPENSEARCH_NAME/*\" }]}" \
     --vpc-options "SubnetIds=${SUBNET_IDS},SecurityGroupIds=${GROUP_ID_OPENSEARCH}"
   ```

   - **Domain Name**: `$OPENSEARCH_NAME` is the name of the OpenSearch domain being created.
   - **Engine Version**: Uses OpenSearch version `2.19`.
   - **Cluster Configuration**:
     - `InstanceType=m7i.large.search` specifies the instance type for the domain.
     - `InstanceCount=3` creates a cluster with 3 instances.
     - `ZoneAwarenessEnabled=true` and `ZoneAwarenessConfig={AvailabilityZoneCount=3}` enable zone awareness and spread the instances across 3 availability zones to improve fault tolerance.
   - **Node-to-Node Encryption**: Encryption for traffic between nodes in the OpenSearch cluster is enabled (`Enabled=true`).
   - **EBS Options**:
     - `EBSEnabled=true` enables Elastic Block Store (EBS) for storage.
     - `VolumeType=gp3` specifies the volume type as `gp3` with 50 GiB of storage.
     - `Iops=3000` and `Throughput=125` set the IOPS and throughput for the storage.
   - **Encryption at Rest**: Data stored in the domain is encrypted at rest (`Enabled=true`).
   - **Access Policies**: The default access policy allows all actions (`es:*`) on resources within the domain for any AWS account (`"Principal": { "AWS": "*" }`). This is scoped to the OpenSearch domain resources using the `arn:aws:es:$REGION:*:domain/$OPENSEARCH_NAME/*` resource ARN.
   - **VPC Options**: The domain is deployed within the specified VPC, restricted to the provided subnets (`SubnetIds=${SUBNET_IDS}`) and associated security group (`SecurityGroupIds=${GROUP_ID_OPENSEARCH}`).

   This configuration creates a secure OpenSearch domain with encryption both in transit (between nodes) and at rest, zonal fault tolerance, and sufficient storage performance using `gp3` volumes. The access is restricted to resources in the VPC of the EKS cluster and is governed by the specified security group.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
