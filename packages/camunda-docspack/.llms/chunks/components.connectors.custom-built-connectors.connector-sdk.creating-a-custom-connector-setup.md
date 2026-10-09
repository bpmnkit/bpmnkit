# Connector SDK — Creating a custom connector — Setup

When developing a new **Connector**, we recommend using one of our custom connector
templates for custom [outbound](https://github.com/camunda/connector-template-outbound) and
[inbound](https://github.com/camunda/connector-template-inbound) connectors.
These templates are [Maven](https://maven.apache.org/)-based Java projects, and can be used in various
ways such as:

- **Create your own GitHub repository**: Click **Use this template** and follow the prompted steps. You can manage code changes in your new repository afterward.
- **Experiment locally**: Check out the source code to your local machine using [Git](https://git-scm.com/). You won't be able to check in code changes to the repository due to restricted write access.
- **Fetch the source**: Download the source code as a ZIP archive using **Code > Download ZIP**.
  You can adjust and manage the code the way you like afterward using your chosen source code
  management tools.

To manually set up your connector project, include the following dependency to use the SDK.
Ensure you adhere to the project outline detailed in the next section.

```xml
<dependency>
  <groupId>io.camunda.connector</groupId>
  <artifactId>connector-core</artifactId>
  <version>${version.connectors}</version>
</dependency>
```

```yml
implementation "io.camunda.connector:connector-core:${version.connectors}"
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
