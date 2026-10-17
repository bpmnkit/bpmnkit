# SAP RFC connector — Configuration and deployment

Unlike other built-in connectors, the SAP RFC connector must be deployed as a Java `.war` archive. This is because it uses SAP's [JCo Java library](https://support.sap.com/en/product/connectors/jco.html) to connect via RFC to the configured SAP system. the JCo library's license prohibits redistribution, but it is available at runtime on BTP and auto-discovered by Camunda's RFC connector.

A descriptor file is required to deploy the SAP RFC connector to a space in a SAP BTP subaccount. An exemplary deployment descriptor `mtad.yaml.example` is provided by Camunda. This is a standard format in SAP BTP's Cloud Foundry environment to describe the application that needs deployment.

### Configuring the RFC connector

Configure the SAP RFC connector via the [CSAP c8ctl plugin](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli) (recommended) or manually. Using `c8ctl csap-setup` simplifies the process by automatically gathering all required files and customizing them for your BTP environment based on the details you provide through prompts or command-line options.

#### Using the CSAP c8ctl plugin

Use the CSAP c8ctl plugin in either:

- **Interactive mode:** By following the on-screen prompts.
- **Non-interactive mode:** By providing all required parameters directly to the plugin.

Use the command `c8ctl csap-setup` to guide you interactively.

- Assuming your [Camunda cluster's API credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) are sourced in your shell environment, this will do the configuration for you:

```shell
c8ctl csap-setup --for rfc \
	--camunda 8.7 \
	--deployment SaaS
```

#### Manual configuration

1. Find the matching `.war` archive for the targeted Camunda 8 SaaS version on the [respective GitHub release page](https://github.com/camunda/sap-rfc-connector/releases).
   The version follows the format `<C8 version major>.<C8 version minor>.<RFC connector version>`.
   Examples:
   - `rfc-8.6.0.war` is the RFC connector in version `0` for Camunda 8 SaaS version `8.6`
   - `rfc-8.5.1.war` is the RFC connector in version `1` for Camunda 8 SaaS version `8.5`

2. Download the matching `mtad.yaml.example` file also from [the GitHub release page](https://github.com/camunda/sap-rfc-connector/releases).
   Adjust the values for the credentials (such as client ID and client secret) to match those of the API client of the targeted Camunda 8 SaaS environment and rename it to `mtad.yaml`.

3. Donwload the connector template from [the GitHub release page](https://github.com/camunda/sap-rfc-connector/releases).

### Deploying to BTP

1. Log into the desired SAP BTP subaccount via the [Cloud Foundry `cli`](https://github.com/cloudfoundry/cli) (cf-cli):

```shell
$> cf login
API endpoint: https://api.cf. ...
...
```

2. Deploy the SAP RFC connector via the `cf-cli`. Note that this requires [the "multiapps" plugin of Cloud Foundry](https://github.com/cloudfoundry/multiapps-cli-plugin) to be installed on the machine the deployment runs on.

```shell
$> cf deploy ./ # append the -f flag to shortcircuit ongoing deployments
Deploying multi-target app archive /some/path/sap-rfc-connector in org <your-org> / space <your-space> as you@example.org ..
...
Application "sap-rfc-connector" started and available at "some.url.hana.ondemand.com"
```

### Deployment in Camunda 8 SaaS

- If using Camunda Hub, [import the SAP RFC connector's element template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#importing-an-existing-element-template) contained in the repository in `element-templates/sap-rfc-connector.json` for use in your process design.

![sap-rfc-connector-task-in-model](./img/sap-rfc-connector-task-in-model.png)

- If using Desktop Modeler, [follow the standard importing procedure](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
