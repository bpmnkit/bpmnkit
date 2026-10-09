# Deploy an EKS cluster with eksctl — 3. PostgreSQL database — Step-by-step setup

1. Identify the VPC associated with the Amazon EKS cluster:

   ```shell
   export VPC_ID=$(aws ec2 describe-vpcs \
     --query "Vpcs[?Tags[?Key=='alpha.eksctl.io/cluster-name']|[?Value=='$CLUSTER_NAME']].VpcId" \
     --output text)

   echo "VPC_ID=$VPC_ID"
   ```

   The variable `VPC_ID` contains the output value required for the next step (the value should look like this: `vpc-1234567890`).

2. Create a security group within the VPC to allow connections to the Aurora PostgreSQL instance:

   ```shell
   export GROUP_ID_AURORA=$(aws ec2 create-security-group \
      --group-name aurora-postgres-sg \
      --description "Security Group to allow the Amazon EKS cluster $CLUSTER_NAME to connect to Aurora PostgreSQL $RDS_NAME" \
      --vpc-id $VPC_ID \
      --query 'GroupId' \
      --output text)

   echo "GROUP_ID_AURORA=$GROUP_ID_AURORA"
   ```

   The variable `GROUP_ID_AURORA` contains the output (the value should look like this: `sg-1234567890`).

3. Create a security Ingress rule to allow access to PostgreSQL:

   ```shell
   aws ec2 authorize-security-group-ingress \
     --group-id $GROUP_ID_AURORA \
     --protocol tcp \
     --port 5432 \
     --cidr $CIDR
   ```

4. Retrieve subnets of the VPC to create a database subnet group:

   ```shell
   export SUBNET_IDS=$(aws ec2 describe-subnets \
     --filter Name=vpc-id,Values=$VPC_ID \
     --query "Subnets[?Tags[?Key=='aws:cloudformation:logical-id']|[?contains(Value, 'Private')]].SubnetId" \
     --output text | expand -t 1)

   echo "SUBNET_IDS=$SUBNET_IDS"
   ```

   The variable `SUBNET_IDS` contains the output values of the private subnets (the value should look like this: `subnet-0123456789 subnet-1234567890 subnet-9876543210`).

5. Create a database subnet group to associate PostgreSQL within the existing VPC:

   ```shell
   aws rds create-db-subnet-group \
       --db-subnet-group-name camunda-postgres \
       --db-subnet-group-description "Subnet for Camunda PostgreSQL $RDS_NAME" \
       --subnet-ids $(echo "$SUBNET_IDS")
   ```

6. Create a PostgreSQL cluster within a private subnet of the VPC:

   For the latest Camunda-supported PostgreSQL engine version, check our [documentation](https://docs.camunda.io/docs/next/reference/supported-environments#camunda-8-self-managed).

   ```shell
   aws rds create-db-cluster \
       --db-cluster-identifier $RDS_NAME \
       --engine aurora-postgresql \
       --engine-version $POSTGRESQL_VERSION \
       --master-username $AURORA_USERNAME \
       --master-user-password $AURORA_PASSWORD \
       --vpc-security-group-ids $GROUP_ID_AURORA \
       --availability-zones $(echo $ZONES) \
       --db-subnet-group-name camunda-postgres
   ```

   More configuration options can be found in the [AWS documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/rds/create-db-cluster.html).

7. Wait for the PostgreSQL cluster to be ready:

   ```shell
   aws rds wait db-cluster-available \
       --db-cluster-identifier $RDS_NAME
   ```

8. Create a database instance within the DB cluster:

   Ensure that the `engine-version` matches the previously created PostgreSQL cluster.

   ```shell
   aws rds create-db-instance \
       --db-instance-identifier $RDS_NAME \
       --db-cluster-identifier $RDS_NAME \
       --engine aurora-postgresql \
       --engine-version $POSTGRESQL_VERSION \
       --no-publicly-accessible \
       --db-instance-class db.t3.medium
   ```

   More configuration options can be found in the [AWS documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/rds/create-db-instance.html).

9. Wait for changes to be applied:

   ```shell
   aws rds wait db-instance-available \
       --db-instance-identifier $RDS_NAME
   ```

   This command will wait until the instance is ready.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
