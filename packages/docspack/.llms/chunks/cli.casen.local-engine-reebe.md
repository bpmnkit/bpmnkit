# casen CLI — Local engine (Reebe)

Reebe is a **dev/test** workflow engine (~50 MB) that serves the Zeebe API locally, so you
can deploy and run processes on your machine or in CI without a Camunda 8 cluster. It is
[Experimental](/docs/getting-started/stability#product-tiers) and single-node: do not run it
in production. Reebe is a clean-room implementation written from Camunda's public
documentation, and is not affiliated with or endorsed by Camunda. "Zeebe" and "Camunda" are
trademarks of Camunda Services GmbH.

```sh
# Embedded SQLite, no external database
casen reebe start

# REST on 26500, where ZEEBE_ADDRESS points by default. The gRPC gateway uses 26500
# unless told otherwise, so move it out of the way.
casen reebe start --port 26500 --grpc-port 26501

# PostgreSQL instead of the embedded database
casen reebe start --database-url postgres://user:pass@localhost/reebe
```

| Flag | Default | Description |
|---|---|---|
| `--port` | `8080` | HTTP (REST) port to listen on |
| `--grpc-port` | `26500` | Zeebe gRPC gateway port; must differ from `--port` |
| `--database-url` | embedded SQLite | PostgreSQL connection URL |
| `--config` | `config.toml` | Path to the engine config file |

`casen reebe` on its own is shorthand for `casen reebe start`. The command runs the
`reebe-server` binary. If it is not on your `PATH`, build the embedded (SQLite) server with
`cargo install --path apps/reebe/crates/reebe-server --no-default-features --features embedded`,
or the PostgreSQL one — which needs `--database-url` — without the two feature flags.

---
Source: https://bpmnkit.com/docs/cli/casen
