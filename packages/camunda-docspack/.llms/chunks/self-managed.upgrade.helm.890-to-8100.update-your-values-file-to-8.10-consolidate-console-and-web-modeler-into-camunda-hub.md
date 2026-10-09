# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Consolidate Console and Web Modeler into Camunda Hub

Camunda 8.10 consolidates Console and Web Modeler into Camunda Hub. Replace all `console` and `webModeler` top-level configurations with `camundaHub`.

**Note**
Existing `webModeler.*` settings remain fallback values, but migrate them to the equivalent flattened `camundaHub.*` paths. Do not nest settings under `camundaHub.webModeler` or `camundaHub.console`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
