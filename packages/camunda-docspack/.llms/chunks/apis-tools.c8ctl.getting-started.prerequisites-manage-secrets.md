# c8ctl CLI — Prerequisites — Manage secrets

`c8 cluster secrets` forwards to the `secrets` command of the c8run binary c8ctl already downloads and manages. c8ctl adds no storage of its own and never sees a secret value: `set` prompts for the value without echoing it (or reads exactly one value from stdin with `--stdin`), and the store is c8run's, shared across versions and projects for the current OS user.

```bash
# Store a secret — prompts, no-echo
c8 cluster secrets set OPENAI_API_KEY

# List secret names (values are never shown)
c8 cluster secrets list

# Import multiple secrets from a dotenv file
c8 cluster secrets import .env.secrets

# Delete a secret without an interactive prompt
c8 cluster secrets delete OPENAI_API_KEY --yes

# Target a specific installed version instead of the running/highest one
c8 cluster secrets --c8-version 8.10 list
```

Everything after `secrets` is passed to c8run unchanged, so any verb or flag c8run supports works here too, including ones added after this was written — run `c8 cluster secrets help` for c8run's own help (`--help` on the `c8ctl` command itself belongs to c8ctl). This requires a c8run build that includes the `secrets` command; older cached versions print a hint if it is missing. Until then, or as an ephemeral alternative for a single run, pass secrets as environment variables when starting instead:

```bash
SECRET_OPENAI_API_KEY=sk-... c8 cluster start
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
