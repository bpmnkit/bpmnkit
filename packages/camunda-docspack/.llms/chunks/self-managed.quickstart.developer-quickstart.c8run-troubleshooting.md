# Troubleshoot Camunda 8 Run

Identify and resolve common issues when starting, configuring, or using Camunda 8 Run.

Camunda 8 Run provides log files in the `c8run/log` directory that can help diagnose most issues. Check these logs first when troubleshooting:

- `camunda.log` – main log for Camunda 8 Run
- `connectors.log` – Connectors component

If you configured external Elasticsearch, inspect that deployment's logs separately.


## Startup failures

### Port conflicts

**Problem:** Camunda 8 Run fails to start because ports are already in use.

**Solution:**

1. Check if the default ports are already occupied:
   - `8080` – Camunda core (Operate, Tasklist, Admin, APIs)
   - `8086` – Connectors API
   - `26500` – Zeebe gRPC gateway
   - `9600` – Prometheus metrics

2. Stop processes using these ports or change the Camunda core port:

   ```bash
   # macOS/Linux
   lsof -i :8080

   # Windows
   netstat -ano | findstr :8080

   # Start Camunda using a different port
   ./c8run start --port 8081
   ```

3. If you also run the Docker Compose quickstart or other local containers, ensure they are not using these ports:

   ```bash
   docker ps
   docker stop <container-name>
   ```

### Java version issues

**Problem:** Camunda 8 Run fails to start with a Java-related error.

**Solution:**

Camunda 8 Run includes a bundled Java runtime. In most cases, no Java installation is needed. If the bundled runtime is missing or corrupted, Camunda 8 Run falls back to the system JDK.

1. Re-download and extract the Camunda 8 Run archive to restore the bundled runtime.

2. If you want to use a system JDK instead, ensure `JAVA_HOME` points to OpenJDK 21–25 and verify it is set correctly:

   ```bash
   # macOS/Linux
   echo $JAVA_HOME
   java -version

   # Windows
   echo %JAVA_HOME%
   ```

3. Set `JAVA_HOME` if needed:

   ```bash
   # macOS
   export JAVA_HOME=$(/usr/libexec/java_home -v 21)

   # Linux
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

   # Windows (PowerShell)
   setx JAVA_HOME "C:\Program Files\Java\jdk-21"
   ```

   Replace `21` with your installed version (21–25), and open a new terminal after setting `JAVA_HOME`.

### Unexpected JVM flags in logs

**Problem:** Camunda 8 Run appends `--enable-native-access=ALL-UNNAMED` and `--sun-misc-unsafe-memory-access=allow` to `JDK_JAVA_OPTIONS` when using Java 25 or newer. This may appear in logs or interfere with tools that inspect JVM options.

**Solution:** This is expected behavior. These flags are required for Java 25 compatibility and are appended automatically. Any values you set in `JDK_JAVA_OPTIONS` beforehand are preserved.

### Incomplete startup

**Problem:** Camunda 8 Run starts but some components fail to load or the browser does not open.

**Solution:**

1. Stop Camunda:

   ```bash
   # macOS/Linux
   ./c8run stop

   # Windows
   c8run.exe stop
   ```

2. Start it again:

   ```bash
   # macOS/Linux
   ./c8run start

   # Windows
   c8run.exe start
   ```

3. Access components manually if the browser does not open automatically:
   - Operate: [http://localhost:8080/operate](http://localhost:8080/operate)
   - Tasklist: [http://localhost:8080/tasklist](http://localhost:8080/tasklist)

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting
