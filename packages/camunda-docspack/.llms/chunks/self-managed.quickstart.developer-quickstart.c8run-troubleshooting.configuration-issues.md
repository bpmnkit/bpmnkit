# Troubleshoot Camunda 8 Run — Configuration issues

### Custom configuration not loading

**Problem:** Changes in `application.yaml` do not take effect.

**Solution:**

1. Pass the configuration file explicitly:

   ```bash
   # macOS/Linux
   ./start.sh --config /path/to/application.yaml

   # Windows
   c8run.exe start --config C:\path\to\application.yaml
   ```

2. Verify that the YAML syntax is correct (spacing, indentation, no tabs).
3. Fully restart Camunda 8 Run after making configuration changes.

### TLS/HTTPS issues

**Problem:** HTTPS is not working or certificate errors occur.

**Solution:**

1. Verify the keystore file path, format, and password:

   ```bash
   # macOS/Linux
   ./start.sh --keystore /path/to/keystore.jks --keystorePassword yourpassword

   # Windows
   c8run.exe start --keystore C:\path\to\keystore.jks --keystorePassword yourpassword
   ```

2. Remember that TLS support in Camunda 8 Run is intended for testing only, not for production environments.
3. Validate the keystore:

   ```bash
   keytool -list -keystore keystore.jks
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
