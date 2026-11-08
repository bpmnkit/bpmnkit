# Troubleshoot Camunda 8 Run — Data and persistence issues

### Lost data after restart

**Problem:** Data such as deployments, process instances, or users disappears after restarting Camunda 8 Run.

**Solution:**

1. Camunda 8 Run stores H2 data on disk by default, so data persists across restarts. If your configuration uses an in-memory H2 URL (`jdbc:h2:mem:`), data is lost when Camunda 8 Run stops. Switch to a file-based URL so data is written to disk:

   ```yaml
   camunda:
     data:
       secondary-storage:
         type: rdbms
         rdbms:
           url: jdbc:h2:file:./camunda-data/h2db
   ```

2. Keep the H2 file path the same between restarts. A different path opens a different, empty database.
3. Check that the application has permission to write to the data directory (for example, `camunda-data/` or any configured mount path).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
