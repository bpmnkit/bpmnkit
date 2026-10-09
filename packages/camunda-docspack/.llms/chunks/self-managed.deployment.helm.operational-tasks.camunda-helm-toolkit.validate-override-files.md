# Use the Camunda Helm Toolkit — Validate override files

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

A clean report doesn't prove deployment readiness. Validation doesn't check live Kubernetes resources, stored data, all cross-file requirements, or whether the complete configuration renders and runs successfully. Review the findings, render or test the complete configuration, and follow the upgrade guide's required checks.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
