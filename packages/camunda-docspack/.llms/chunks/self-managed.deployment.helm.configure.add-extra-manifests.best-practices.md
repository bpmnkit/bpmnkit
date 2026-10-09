# Add custom Kubernetes manifests in Helm charts — Best practices

- **Keep it simple**: Use clear and concise YAML syntax to avoid complexity.
- **Use comments**: Include comments in your YAML file to explain the purpose of each manifest.
- **Test thoroughly**: Ensure that all added manifests are correctly formatted and functional before deployment.


## Troubleshooting

### `helm install` or `helm upgrade` fails with a YAML parsing error

**Observed behavior:** Helm fails before it starts applying resources, with an error about parsing the values file.

**Why this happens:** The manifest string under `global.extraManifests` has invalid YAML syntax, most often an indentation issue or a missing colon in a key-value pair, which breaks the outer `values.yaml` structure.

**How to fix:** Validate the manifest's YAML syntax on its own (for example, with `yamllint` or `kubectl apply --dry-run=client -f <file>` against a copy saved to a file), then correct the indentation or missing syntax.

### Helm succeeds, but the resource isn't created or the API server rejects it

**Observed behavior:** `helm install` or `helm upgrade` completes, but the extra manifest's resource doesn't appear in the cluster, or `kubectl` shows a validation error for it.

**Why this happens:** The manifest is valid YAML, but not a valid Kubernetes object, for example, an incorrect `apiVersion` or `kind`, or a missing required field.

**How to fix:** Save the manifest to a file and validate it against the Kubernetes API without applying it:

```bash
kubectl apply --dry-run=server -f <file>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/add-extra-manifests
