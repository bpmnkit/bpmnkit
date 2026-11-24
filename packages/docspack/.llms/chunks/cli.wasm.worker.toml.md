# bpmnkit worker wasm — `worker.toml`

The manifest is what a human approves. Unknown keys are rejected. Everything except `[worker]` is optional.

```toml
[worker]
name      = "charge-card"      # ^[a-z0-9][a-z0-9-]{0,62}$
version   = "0.1.0"            # semver
job_types = ["charge-card"]    # same pattern, no wildcards, no duplicates, at least one

[limits]
memory_mb      = 64            # default 64,     ceiling 256
timeout_ms     = 10_000        # default 10 000, ceiling 60 000
max_concurrent = 8             # default 8,      ceiling 64

[network]
allow = ["api.stripe.com:443"] # exact host:port, port 443 only; empty = no HTTP at all

[secrets]
names = ["STRIPE_KEY"]         # ^[A-Z][A-Z0-9_]{0,63}$
```

| Field | Rule |
|-------|------|
| `limits.*` | Greater than 0 and at most the platform ceiling; a manifest may ask for less, never more. |
| `network.allow` | An empty list builds the `worker` world (no HTTP import); a non-empty list builds `worker-http`. Entries must be unique. |
| `secrets.names` | The host resolves a name from `BPMNKIT_WASM_SECRET_<NAME>` or a file in `--secrets-dir`. |

Violations are listed together, e.g. ``limit memory_mb = 512 exceeds the platform ceiling 256``.

---
Source: https://bpmnkit.com/docs/cli/wasm
