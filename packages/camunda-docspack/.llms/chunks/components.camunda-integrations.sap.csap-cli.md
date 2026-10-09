# CSAP c8ctl plugin

Use the CSAP plugin for c8ctl to configure all SAP integration artifacts for deployment.

The [Camunda SAP Integration CLI](https://docs.camunda.io/docs/next/reference/glossary#csap-cli) (CSAP) is a plugin for [c8ctl](https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started) that simplifies the setup of Camunda's SAP integration modules. It provides a streamlined process for configuring and building these modules for deployment.

**Warning**
The standalone `csap` binary is deprecated and replaced by the `c8ctl-plugin-csap-cli` plugin. The plugin offers the same functionality. It is a Node.js port of the original tool, so you no longer need Deno. See [migrate from the `csap` binary](#migrate-from-the-csap-binary).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
