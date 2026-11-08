# Prepare Helm upgrades with the Camunda Helm Toolkit — Validate override files

Run `validate` to check an existing or edited override without migrating it.

```bash
docker run --rm --pull always \
  --user "$(id -u):$(id -g)" --workdir /tmp \
  -v "$PWD":/work:ro \
  camunda/camunda-helm-toolkit:SNAPSHOT validate \
  --input /work/values-8.10.yaml --target 8.10 \
  --output-format markdown
```

Validation checks the keys your file contains for types, unsupported or deprecated settings, and configuration rules. It doesn't require an override to contain every chart setting. Each file is checked separately, not as the merged result of all Helm layers.

Validation doesn't check live Kubernetes resources, stored data, all cross-file requirements, or whether the complete configuration renders and runs successfully. [Act on the report](#what-to-do-with-the-report), then render and test the complete configuration and follow the upgrade guide's required checks.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
