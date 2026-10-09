# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Access internal infrastructure

**Warning: Not recommended in production**

These approaches are intended for **development and troubleshooting purposes only**.
For a production cluster, use a proper VPN or other secure access methods.

Some infrastructure components, such as OpenSearch dashboards or Aurora PostgreSQL databases, are accessible only from inside the Virtual Private Cloud (VPC).
You can use a temporary pod as a _jump host_ to tunnel traffic to these components.

---

Generic approach using a jump host

**Component connection details**

Export `REMOTE_HOST`, `REMOTE_PORT`, and `LOCAL_PORT` with the component-specific values:

| Component            | `REMOTE_HOST`      | `REMOTE_PORT`  | `LOCAL_PORT` |
| -------------------- | ------------------ | -------------- | ------------ |
| OpenSearch dashboard | `$OPENSEARCH_HOST` | `443`          | `9200`       |
| Aurora PostgreSQL    | `$AURORA_ENDPOINT` | `$AURORA_PORT` | `5432`       |

1. Run a socat pod to create a TCP tunnel:

   ```bash
   kubectl --namespace $CAMUNDA_NAMESPACE run my-jump-pod -it \
   --image=alpine/socat \
   --tty --rm \
   --restart=Never \
   --expose=true --port=$REMOTE_PORT -- \
   tcp-listen:$REMOTE_PORT,fork,reuseaddr \
   tcp-connect:$REMOTE_HOST:$REMOTE_PORT
   ```

**Tip: How it works**
   [socat](http://www.dest-unreach.org/socat/) (_SOcket CAT_) is a command-line tool that relays data between two network endpoints.

   In this command:
   - `tcp-listen:$REMOTE_PORT,fork,reuseaddr` listens on the specified port in the pod and can handle multiple connections.
   - `tcp-connect:$REMOTE_HOST:$REMOTE_PORT` forwards all incoming traffic to the internal component endpoint.

   Combined with `kubectl port-forward` (step 2), the flow is:

   ```
   Local Client → localhost:$LOCAL_PORT → port-forward → my-jump-pod:$REMOTE_PORT → socat → Remote Component
   ```

   This setup lets you securely reach internal components without exposing them publicly.

2. Port-forward the pod to your local machine:

   ```bash
   kubectl port-forward --namespace $CAMUNDA_NAMESPACE pod/my-jump-pod $LOCAL_PORT:$REMOTE_PORT
   ```

3. Connect to the component:

   _OpenSearch example:_

   ```bash
   https://localhost:$LOCAL_PORT/_dashboards
   ```

   Accept the insecure connection if prompted.

   _Aurora PostgreSQL example:_

   ```bash
   PGPASSWORD=$AURORA_PASSWORD psql -h localhost -p $LOCAL_PORT -U $AURORA_USERNAME -d <DATABASE>
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
