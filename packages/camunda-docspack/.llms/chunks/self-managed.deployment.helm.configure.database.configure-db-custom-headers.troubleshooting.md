# Configure custom HTTP headers for database clients — Troubleshooting

### `Unknown type of interceptor plugin or wrong class specified`

**Observed behavior:** Startup fails with `Unknown type of interceptor plugin or wrong class specified`.

**Why this happens:** The class configured in the `CLASSNAME` property is incorrect. Possible causes include:

- The class name or package doesn't exist.
- The class doesn't implement the required SDK interface.
- The class is defined as `inner`, `static`, or `final`.

**How to fix:**

- Use the latest Search Plugins SDK.
- Ensure your class implements the correct SDK interface.
- Verify that the plugin class is `public` and not `final`.

### `Failed to load interceptor plugin due to exception`

**Observed behavior:** Startup fails with `Failed to load interceptor plugin due to exception`.

**Why this happens:** This error usually indicates an issue with JAR loading, either the path is wrong, the file isn't readable, or the JAR is missing required dependencies.

**How to fix:**

1. Confirm the path to your plugin JAR file is correct and that the application has permission to read it.
2. Confirm the JAR is valid and contains all required dependencies. Check its contents with:
   ```bash
   jar xf <file-name>.jar
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/configure-db-custom-headers
