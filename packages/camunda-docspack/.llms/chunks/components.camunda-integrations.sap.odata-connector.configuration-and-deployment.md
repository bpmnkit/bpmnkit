# SAP OData connector — Configuration and deployment

A descriptor file is required to deploy the SAP OData connector to a space in a SAP BTP subaccount. An exemplary deployment descriptor `mtad.yaml.example` is provided by Camunda. This is a standard format in SAP BTP's Cloud Foundry environment to describe the application requiring deployment.

### Using the CSAP c8ctl plugin

Use the CSAP c8ctl plugin in either:

- **Interactive mode**: Follow the on-screen prompts.
- **Non-interactive mode**: Provide all required parameters directly to the plugin.

Configure the OData connector via the [CSAP c8ctl plugin](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli) (recommended) or manually. Using `c8ctl csap-setup` simplifies the process by automatically gathering all required files and customizing them for your BTP environment based on the details you provide through prompts or command-line options.

Use the command `c8ctl csap-setup` to guide you interactively.

- Assuming your [Camunda cluster's API credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) are sourced in your shell environment, this will do the configuration for you:

```shell
c8ctl csap-setup --for odata \
	--camunda 8.7 \
	--deployment SaaS
```

### Manual configuration

Follow these steps:

1. Find the matching [Docker image](https://hub.docker.com/r/camunda/sap-odata-connector/tags) for the targeted Camunda 8 SaaS version.
   The version follows the format `<C8 version major>.<C8 version minor>.<OData connector version>`.
   Examples:
   - `8.6.0` is the OData connector in version `0` for Camunda 8 SaaS version `8.6`
   - `8.5.1` is the OData connector in version `1` for Camunda 8 SaaS version `8.5`

2. Download the matching `mtad.yaml.example` from [the OData connector's GitHub release page](https://github.com/camunda/sap-odata-connector/releases). Adjust the values for the credentials (`client ID`, client secret, etc.) to match those of the API client of the targeted Camunda 8 SaaS environment and rename it to `mtad.yaml`.
3. Customize the names of the SAP BTP Destination and Connectivity instances as needed. Both will be automatically created during deployment. If instances with the same names already exist in your subaccount, they will be reused.
4. Download the connector template from the [OData connector's GitHub release page](https://github.com/camunda/sap-odata-connector/releases).

### Deploying to SAP BTP

1. Log into the desired SAP BTP subaccount via the [Cloud Foundry `cf-cli`](https://github.com/cloudfoundry/cli):

```shell
$> cf login
API endpoint: https://api.cf. ...
...
```

2. Deploy the SAP OData connector via the `cf-cli`.
   Note that this requires [the "multiapps" plugin of Cloud Foundry](https://github.com/cloudfoundry/multiapps-cli-plugin) to be installed on the machine the deployment runs on:

```shell
$> cf deploy ./ # append the -f flag to shortcircuit ongoing deployments
Deploying multi-target app archive /some/path/sap-odata-connector in org <your-org> / space <your-space> as you@example.org ..
...
Application "sap-odata-connector" started and available at "some.url.hana.ondemand.com"
```

### Deployment in Camunda 8 SaaS

- If you are using Camunda Hub, [import the SAP OData connector element](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#importing-an-existing-element-template) you downloaded in the earlier step to use it in your process design.

![sample BPMN diagram with SAP OData connector](./img/sap-odata-connector-task-in-model.png)

- If you are using Desktop Modeler, [follow the standard importing procedure](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
