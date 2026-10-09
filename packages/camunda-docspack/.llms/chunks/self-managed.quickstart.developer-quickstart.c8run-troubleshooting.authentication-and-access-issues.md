# Troubleshoot Camunda 8 Run — Authentication and access issues

### Cannot log in to web interfaces

**Problem:** Default credentials (demo/demo) do not work or the login page does not appear.

**Solution:**

1. Verify authentication settings (default: demo/demo).

2. If custom authentication is configured in `application.yaml`, ensure it is correct:

   ```yaml
   camunda:
     security:
       authentication:
         method: BASIC
       initialization:
         users:
           - username: demo
             password: demo
   ```

3. Clear browser cache and cookies, then try again.
4. If you used command-line overrides at startup (such as `--username` or `--password`), ensure the values are correct:

   ```bash
   # macOS/Linux
   ./start.sh --username myuser --password mypassword

   # Windows
   c8run.exe start --username myuser --password mypassword
   ```

### API authentication errors

**Problem:** API calls fail with authentication errors even when authentication is disabled by default.

**Solution:**

1. Verify that API authentication is disabled (this is the default):

   ```yaml
   camunda:
     security:
       authentication:
         unprotected-api: true
   ```

2. If API authentication is enabled, include credentials in your API requests:

   ```bash
   curl -u demo:demo http://localhost:8080/v2/topology
   ```

   Windows (PowerShell alternative without curl):

   ```powershell
   $pair = "demo:demo"
   bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
   $base64 = [System.Convert]::ToBase64String($bytes)
   Invoke-WebRequest -Uri http://localhost:8080/v2/topology -Headers @{Authorization="Basic $base64"}
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
