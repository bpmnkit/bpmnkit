# Development workflows — Profile management

For full profile management documentation, including adding, listing, switching, and removing profiles, see [Getting started — Profile management](https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started#profile-management).

### Quick reference

```bash
c8 add profile prod --baseUrl=https://camunda.example.com --clientId=xxx --clientSecret=yyy
c8 list profiles
c8 use profile prod
c8 which profile
c8 remove profile prod
```

### One-off profile override

Pass `--profile` to any command to use a different profile for that single invocation. The active session profile is not changed:

```bash
# Run a command against a different cluster
c8 list pi --profile=staging

# Deploy to production without switching context
c8 deploy ./release/ --profile=prod

# Use a Camunda Modeler profile for one command
c8 search ut --state=CREATED --profile=modeler:Cloud Cluster
```

This is useful when you are working against a local development cluster but need to quickly check or interact with another environment.

### Camunda Modeler integration

`c8ctl` automatically discovers and imports profiles from Camunda Modeler. These profiles are read-only, always prefixed with `modeler:`, and loaded dynamically on each command execution.

```bash
# Set a Modeler profile as the active session profile
c8 use profile "modeler:Local Dev"

# Use a Modeler profile for one command
c8 list pi --profile=modeler:Cloud Cluster

# Deploy using a Modeler profile
c8 deploy ./process.bpmn --profile=modeler:Local Dev
```

For Modeler profile file locations per platform, see [Getting started — Camunda Modeler integration](https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started#camunda-modeler-integration).

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
