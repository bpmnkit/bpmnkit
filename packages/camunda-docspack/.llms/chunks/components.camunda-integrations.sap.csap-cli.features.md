# CSAP c8ctl plugin — Features

- Runs as a c8ctl plugin - no separate binary required.
- Interactive prompts for configuration.
- Command-line flags for automation.
- Support for multiple SAP integration modules.
- Automatic handling of dependencies and build processes.
- Compatibility with Camunda SaaS deployments.


## Supported modules

The plugin supports the following SAP integration modules:

| Module              | Flag value | Description                                                                |
| ------------------- | ---------- | -------------------------------------------------------------------------- |
| SAP OData connector | `odata`    | Facilitates interaction with SAP S/4HANA or ECC systems from a BPMN model. |
| SAP RFC connector   | `rfc`      | Allows querying BAPIs and Remote Function Modules on SAP ECC systems.      |
| All modules         | `all`      | Configures all available modules.                                          |

The plugin supports Camunda 8.7, 8.8, and 8.9. Support for Camunda 8.6 is deprecated.

The plugin downloads the OData and RFC connectors from the [sap-connectors](https://github.com/camunda/sap-connectors) repository. The plugin source code is available in the [c8ctl-plugin-csap-cli](https://github.com/camunda/c8ctl-plugin-csap-cli) repository.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
