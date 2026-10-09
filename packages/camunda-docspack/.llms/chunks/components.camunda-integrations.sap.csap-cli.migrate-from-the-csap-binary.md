# CSAP c8ctl plugin — Migrate from the `csap` binary

To migrate from the deprecated `csap` binary to the c8ctl plugin, install the plugin and replace `csap setup` with `c8ctl csap-setup` in your scripts and pipelines.

1. Install c8ctl and [load the plugin](#installation).
1. Replace `csap setup` with `c8ctl csap-setup` in your scripts and CI/CD pipelines.
1. Remove the `csap` binary from your `PATH`.

All flags and environment variables keep their names and meaning. The default values for `--for`, `--camunda`, and `--deployment` can differ from the `csap` binary, so pass them explicitly in non-interactive runs.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
