# Development workflows — Open web applications

Open Camunda web applications in your default browser using the `open` command:

```bash
c8 open operate
c8 open tasklist
c8 open modeler
c8 open optimize
```

The URL is derived from the active profile's base URL. This works with self-managed clusters where the base URL ends with a version suffix (for example, `http://localhost:8080/v2`).

Use `--dry-run` to display the URL without opening the browser:

```bash
c8 open operate --dry-run
```

Use `--profile` to open an application for a specific cluster:

```bash
c8 open operate --profile=prod
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
