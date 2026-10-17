# c8ctl CLI — Credential resolution

`c8ctl` resolves credentials in the following order:

1. **`--profile` flag** — one-off override for a single command.
2. **Active profile** — set with `c8 use profile <name>`.
3. **Environment variables** — standard `CAMUNDA_*` variables (take precedence over the default profile).
4. **Default `local` profile** — `http://localhost:8080/v2`.

When no profile has been explicitly set, `c8ctl` defaults to a built-in `local` profile that points to `http://localhost:8080/v2`. This means you can start a local cluster with `c8 cluster start` and immediately run commands without any configuration. If the connection fails, `c8ctl` shows a hint with the URL it tried to connect to.

### Use environment variables

```bash
export CAMUNDA_BASE_URL=https://camunda.example.com
export CAMUNDA_CLIENT_ID=your-client-id
export CAMUNDA_CLIENT_SECRET=your-client-secret
c8 list pi
```

### Use a profile

```bash
c8 add profile prod \
  --baseUrl=https://camunda.example.com \
  --clientId=your-client-id \
  --clientSecret=your-client-secret

c8 use profile prod
c8 list pi
```

### Override the profile for a single command

Pass `--profile` to any command to use a different profile without changing the active session:

```bash
c8 list pi --profile=staging
c8 deploy ./process.bpmn --profile=prod
c8 search ut --assignee=jane --profile=dev
```

The `--profile` flag works with both `c8ctl` profiles and Camunda Modeler profiles (prefixed with `modeler:`):

```bash
c8 list pi --profile=modeler:Cloud Cluster
c8 deploy ./process.bpmn --profile=modeler:Local Dev
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
