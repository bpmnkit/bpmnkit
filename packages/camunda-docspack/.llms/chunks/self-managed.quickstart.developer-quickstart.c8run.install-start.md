# Install and start Camunda 8 Run

Install Camunda 8 Run locally, start it on macOS, Linux, or Windows, and shut it down cleanly.

<!-- markdownlint-disable MD033 -->

Use this page to install Camunda 8 Run locally, start it on macOS, Linux, or Windows, and shut it down cleanly.


## Prerequisites

- **[Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/install-the-modeler)**
- **If using Ubuntu**: Ubuntu 22.04 or newer


## Install and start Camunda 8 Run

1. Download the latest release of Camunda 8 Run for your operating system and architecture. Opening the `.tgz` file extracts the Camunda 8 Run script into a new directory.
2. Navigate to the new `c8run` directory.
3. Start Camunda 8 Run by following the steps below, depending on your operating system.

### maclinux

Run the helper script:

```bash
./start.sh
```

Or use the CLI command:

```bash
./c8run start
```

### windows

Use the CLI command:

```bash
.\c8run.exe start
```

If startup is successful, a browser window for Operate will open automatically. Alternatively, you can access Operate at [http://localhost:8080/operate](http://localhost:8080/operate).

**Note**
If Camunda 8 Run fails to start, run the [shutdown script](#shut-down-camunda-8-run) to end the current processes, then run the start script again.

For container-based local deployments, see the [developer quickstart with Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose).

For CLI flags and permanent configuration, see [configure Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start
