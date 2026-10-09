# Troubleshoot Camunda 8 Run — Data and persistence issues

### Lost data after restart

**Problem:** Data such as deployments, process instances, or users disappears after restarting Camunda 8 Run.

**Solution:**

1. If using H2 in-memory mode, switch to file-based persistence so data is written to disk:

   ```yaml
   camunda:
     data:
       secondary-storage:
         type: rdbms
         rdbms:
           url: jdbc:h2:file:./camunda-data/h2db
   ```

2. Check that the application has permission to write to the data directory (for example, `camunda-data/` or any configured mount path).


## Connector issues

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

1. For non-Docker mode, export connector secrets as environment variables:

   ```bash
   export MY_SECRET_KEY=secret_value
   ```

2. For the Docker Compose setup, add secrets to the `connector-secrets.txt` file located in the Docker Compose folder.
3. Restart Camunda 8 Run after adding or modifying secrets.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
