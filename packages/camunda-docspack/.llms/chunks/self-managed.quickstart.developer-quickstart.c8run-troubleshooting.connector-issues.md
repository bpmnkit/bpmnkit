# Troubleshoot Camunda 8 Run — Connector issues

### Custom connectors not loading

**Problem:** Custom connector JARs are not recognized by Camunda 8 Run.

**Solution:**

1. Verify that the connector JAR file is placed in the correct directory:

   ```bash
   # macOS/Linux
   c8run/custom_connectors/your-connector.jar

   # Windows
   c8run\custom_connectors\your-connector.jar
   ```

2. Ensure that the corresponding element template is available in a valid Desktop Modeler search path.

3. Restart Camunda 8 Run after adding or updating connectors.

4. Check the `connectors.log` file for specific error messages that may explain why the connector failed to load.

### Connector secrets not working

**Problem:** Connectors cannot access configured secrets.

**Solution:**

1. For non-Docker mode, add each secret to the local secret store, then reference it with `camunda.secrets.<name>`. For details, see [manage local secrets](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration#manage-local-secrets).

   ```bash
   # macOS/Linux
   ./c8run secrets set MY_SECRET_KEY

   # Windows
   c8run.exe secrets set MY_SECRET_KEY
   ```

2. For the Docker Compose setup, add secrets to the `connector-secrets.txt` file located in the Docker Compose folder.
3. Restart Camunda 8 Run after adding or modifying secrets.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
