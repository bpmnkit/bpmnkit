# Install Camunda with Helm for development — Prerequisites (2)

4. **Access the components:**

   Use the default credentials:

   ```
   username: demo
   password: demo
   ```

   Set up port-forwarding to access the services:

   ```bash
   # Zeebe Gateway (for gRPC and REST API)
   kubectl port-forward svc/camunda-zeebe-gateway 26500:26500 -n orchestration
   kubectl port-forward svc/camunda-zeebe-gateway 8080:8080 -n orchestration

   # Connectors
   kubectl port-forward svc/camunda-connectors 8088:8080 -n orchestration
   ```

   **Verify the installation:**

Test the [Zeebe Gateway](https://docs.camunda.io/docs/next/reference/glossary#zeebe-gateway) HTTP endpoint (Orchestration Cluster REST API):

```bash
curl -u demo:demo http://localhost:8080/v2/topology
```

You should see a JSON response with the cluster topology information.

Available services:

- **Operate:** [http://localhost:8080/operate](http://localhost:8080/operate) - Monitor process instances
- **Tasklist:** [http://localhost:8080/tasklist](http://localhost:8080/tasklist) - Complete user tasks
- **Admin:** [http://localhost:8080/admin](http://localhost:8080/admin) - User and permission management
- **Connectors:** [http://localhost:8088](http://localhost:8088) - External system integrations
- **Zeebe Gateway (gRPC):** localhost:26500 - Process deployment and execution
- **Zeebe Gateway (HTTP):** [http://localhost:8080](http://localhost:8080) - Orchestration Cluster REST API

**Note**
In Camunda 8.8+, Operate, Tasklist, and Admin are integrated into the Orchestration Cluster and share the same endpoint (port 8080).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
