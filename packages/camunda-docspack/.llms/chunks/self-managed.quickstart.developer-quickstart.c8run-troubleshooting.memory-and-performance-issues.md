# Troubleshoot Camunda 8 Run — Memory and performance issues

### Out of memory errors

**Problem:** Camunda 8 Run becomes unresponsive.

**Solution:**

1. Increase JVM heap for Camunda:

   ```bash
   # macOS/Linux
   export JAVA_OPTS="-Xmx4g"

   # Windows (Command Prompt)
   set JAVA_OPTS=-Xmx4g

   # Windows (PowerShell)
   $env:JAVA_OPTS="-Xmx4g"
   ```

2. For resource-constrained environments, consider using H2 instead of Elasticsearch for testing.

### Slow performance

**Problem:** Camunda 8 Run is slow or processes take a long time to appear in Operate.

**Solution:**

1. Ensure the system meets the minimum requirements (8 GB RAM recommended).
2. Close unnecessary applications to free system resources.
3. If you use external Elasticsearch, check cluster health:

   ```bash
   curl http://localhost:9200/_cluster/health
   ```

On Windows, open this page directly: [http://localhost:9200/\_cluster/health](http://localhost:9200/_cluster/health)

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
