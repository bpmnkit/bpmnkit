# Run your first BPMN process with Camunda 8 — Step 1: Download the Getting Started Package

Download the Getting Started Package from [Camunda Downloads](https://docs.camunda.io/docs/next/downloads).

The starter package includes the following components:

- [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run): A simplified, single-application Camunda configuration for a local development environment.
- [Camunda Modeler](https://docs.camunda.io/docs/next/components/modeler/about-modeler): An application for modeling BPMN, DMN, and Forms.
- [Getting started project](https://github.com/camunda/camunda-8-get-started): Example projects including the Rocket Launch process used in this guide.


## Step 2: Deploy and run your model

1. Unzip the Camunda 8 starter package.
2. Start Camunda 8 Run by changing to its directory and running the following command based on your OS:

### maclinux

```bash
./camunda-start.sh
```

### windows

```bash
.\camunda-start.bat
```

3. Open Camunda Modeler from the starter package.
4. Click **File**, then **Open File** to open the process model `camunda-8-get-started/1-rocket-launch/rocket-launch.bpmn`.
5. Deploy your model by clicking the rocket icon in the bottom toolbar. You can use the pre-configured **c8run (local)** connection and click **Deploy Camunda Project**. This automatically deploys all resources in the [project](https://docs.camunda.io/docs/next/components/concepts/projects), including the DMN decision table.
6. Click the play icon in the bottom toolbar to start a new [process instance](https://docs.camunda.io/docs/next/reference/glossary#process-instance).
7. Run your first model instance by setting the input mission variables. For example:

```json
{ "missionName": "Odyssey", "fuelLevel": 95 }
```

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-hello-world
