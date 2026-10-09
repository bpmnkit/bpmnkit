# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because the Hub sender address is missing

If `helm upgrade` fails with `The value 'webModeler.restapi.mail.fromAddress' is required`, Camunda Hub has no sender address for emails. Set `camunda.hub.mail.from-address` in a `camundaHub.restapi.extraConfiguration` file that Spring imports. The chart finds the key as nested or dotted YAML in any document of the file, and in a `.properties` file. The chart also accepts the legacy `camunda.modeler.mail.from-address`, `camundaHub.restapi.mail.fromAddress`, and `webModeler.restapi.mail.fromAddress`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
