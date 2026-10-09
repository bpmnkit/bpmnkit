# Deploy an EKS cluster with eksctl — 3. PostgreSQL database — Create the databases

Now that you have a database, you need to create dedicated databases for each Camunda component along with associated users that have configured access.

We will also use this step to verify connectivity to the database from the created EKS cluster. The creation of the databases will be performed by spawning a pod job in the Kubernetes cluster, using the main user to create the different databases.

1. Retrieve the writer endpoint of the DB cluster:

   ```shell
   export DB_HOST=$(aws rds describe-db-cluster-endpoints \
     --db-cluster-identifier $RDS_NAME \
     --query "DBClusterEndpoints[?EndpointType=='WRITER'].Endpoint" \
     --output text)

   echo "DB_HOST=$DB_HOST"
   ```

2. Create a secret that references the environment variables:

   ```bash
   kubectl create secret generic setup-db-secret --namespace "$CAMUNDA_NAMESPACE" \
     --from-literal=AURORA_ENDPOINT="$DB_HOST" \
     --from-literal=AURORA_PORT="5432" \
     --from-literal=AURORA_DB_NAME="postgres" \
     --from-literal=AURORA_USERNAME="$AURORA_USERNAME" \
     --from-literal=AURORA_PASSWORD="$AURORA_PASSWORD" \
     --from-literal=DB_KEYCLOAK_NAME="$DB_KEYCLOAK_NAME" \
     --from-literal=DB_KEYCLOAK_USERNAME="$DB_KEYCLOAK_USERNAME" \
     --from-literal=DB_KEYCLOAK_PASSWORD="$DB_KEYCLOAK_PASSWORD" \
     --from-literal=DB_IDENTITY_NAME="$DB_IDENTITY_NAME" \
     --from-literal=DB_IDENTITY_USERNAME="$DB_IDENTITY_USERNAME" \
     --from-literal=DB_IDENTITY_PASSWORD="$DB_IDENTITY_PASSWORD" \
     --from-literal=DB_WEBMODELER_NAME="$DB_WEBMODELER_NAME" \
     --from-literal=DB_WEBMODELER_USERNAME="$DB_WEBMODELER_USERNAME" \
     --from-literal=DB_WEBMODELER_PASSWORD="$DB_WEBMODELER_PASSWORD"
   ```

   This command creates a secret named `setup-db-secret` and dynamically populates it with the values from your environment variables.

   After running the above command, you can verify that the secret was created successfully by using:

   ```bash
   kubectl get secret setup-db-secret -o yaml --namespace "$CAMUNDA_NAMESPACE"
   ```

   This should display the secret with the base64 encoded values.

3. Save the following manifest to a file, for example, `setup-postgres-create-db.yml`:

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/setup-postgres-create-db.yml
   ```

   This manifest creates the component databases only. The **RDBMS** secondary storage variant needs an additional `camunda_orchestration` database and `orchestration_db` user, which this eksctl path does not provision. To run the Orchestration Cluster on Aurora PostgreSQL, follow the RDBMS variant of the [EKS Terraform setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#variants) instead.

4. Apply the manifest:

   ```bash
   kubectl apply -f setup-postgres-create-db.yml --namespace "$CAMUNDA_NAMESPACE"
   ```

   Once the secret is created, the **Job** manifest from the previous step can consume this secret to securely access the database credentials.

5. Once the job is created, monitor its progress using:

   ```bash
   kubectl get job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE" --watch
   ```

   Once the job shows as `Completed`, the users and databases will have been successfully created.

6. View the logs of the job to confirm that the users were created and privileges were granted successfully:

   ```bash
   kubectl logs job/create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
   ```

7. Cleanup the resources:

   ```bash
   kubectl delete job create-setup-user-db --namespace "$CAMUNDA_NAMESPACE"
   kubectl delete secret setup-db-secret --namespace "$CAMUNDA_NAMESPACE"
   ```

   Running these commands will clean up both the job and the secret, ensuring that no unnecessary resources remain in the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
