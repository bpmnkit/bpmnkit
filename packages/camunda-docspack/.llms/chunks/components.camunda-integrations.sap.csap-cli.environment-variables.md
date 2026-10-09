# CSAP c8ctl plugin — Environment variables

The plugin can detect Camunda API credentials from environment variables. If these variables are set, the plugin reuses them without prompting for input. Flags take precedence over environment variables.

| Environment variable     | Description               |
| ------------------------ | ------------------------- |
| `CAMUNDA_CLUSTER_ID`     | Camunda cluster ID        |
| `CAMUNDA_CLIENT_ID`      | Camunda API client ID     |
| `CAMUNDA_CLIENT_SECRET`  | Camunda API client secret |
| `CAMUNDA_CLUSTER_REGION` | Camunda cluster region    |

### Examples

#### Example 1: Interactive setup

```bash
$> c8ctl csap-setup

# ...

? SAP integration module
❯ OData connector
  RFC connector
  All modules
```

This guides you through the setup process interactively.

#### Example 2: Setting up all modules, reusing credentials from environment

```bash
$> c8ctl csap-setup --for all \
  --camunda 8.8 \
  --deployment SaaS

# ...

i Camunda API credentials found in environment. Reusing
┌────────────────────────┬──────────┐
│ (idx)                  │ Values   │
├────────────────────────┼──────────┤
│ CAMUNDA_CLUSTER_ID     │ "***5ee" │
│ CAMUNDA_CLIENT_ID      │ "***icQ" │
│ CAMUNDA_CLIENT_SECRET  │ "***XEq" │
│ CAMUNDA_CLUSTER_REGION │ "***d-1" │
└────────────────────────┴──────────┘
```

This command sets up all available SAP integration modules for Camunda version 8.8.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
