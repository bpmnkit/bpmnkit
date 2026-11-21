# REST connector fixtures

One JSON file per case for `bpmnkit-connector-runtime`, the local runner of Camunda's REST
connector (`io.camunda:http-json:1`). Unlike the rest of `conformance/`, TypeScript is not the
oracle (`packages/connectors` has no executor): the oracle is the real Camunda 8.8 connector
runtime.

```json
{
  "description": "…", "source": "<docs URL the case is derived from>",
  "recorded": false,
  "env": { "SECRET_NAME": "value" },          // secrets the runtime sees (optional)
  "secretPrefix": "SUPER_SECRETS_",           // CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX (optional)
  "job": { "retries": 3, "variables": { … }, "headers": { … } },
  "exchanges": [ { "request": { … }, "response": { … } } ],
  "expected": { "complete" | "fail" | "throwError": { …8.8 request body… } }
}
```

- `job.variables` are the connector properties after Zeebe's input mappings (`method`, `url`,
  `headers`, `queryParameters`, `body`, `authentication.*`, timeouts …); `job.headers` the task
  headers (`resultExpression`, `errorExpression`, `resultVariable`, `retryBackoff`).
- URLs use the host `http://mock.local`; the replay points it at a local mock.
- `request` lists what must arrive: `method`, `path`, `query` (decoded, exact), `headers` (names
  case-insensitive, listed ones only), and one of `body` (JSON), `bodyText` or `form`.
  `response` is `status`, `headers` and `body` (JSON) or `bodyText`.
- `secretsEchoed` (optional) names secrets the command may legitimately contain; every other
  `env` value must appear neither in the command nor in the logs (redaction assert).

## Replay (CI, every `cargo test --workspace`)

```sh
cargo test -p bpmnkit-connector-runtime --test replay
BPMNKIT_BLESS=1 cargo test -p bpmnkit-connector-runtime --test replay   # rewrite `expected`
```

No network. Never bless a fixture with `"recorded": true` unless the runner was wrong.

## Recording against a real 8.8 runtime (manual, once)

The cases were written from the Camunda docs (`source`) and `expected` comes from the runner
(`"recorded": false`). To replace them with what Camunda itself does:

1. Start Camunda 8.8 with connectors, e.g. the `docker-compose-core.yaml` of
   [camunda-distributions](https://github.com/camunda/camunda-distributions) at the 8.8 tag, or
   c8run 8.8. Pass the secrets the script prints to the connectors container (`environment:`),
   and make sure it can reach the host (`extra_hosts: ["host.docker.internal:host-gateway"]` on
   Linux). Use no authentication on the REST API (or put a proxy in front).
2. `node scripts/record-connectors.mjs --camunda http://localhost:8080`
   (`--mock-host`, `--mock-port`, `--only a,b`). It serves each fixture's responses, warns when
   the runtime's requests differ from the recorded ones, and writes `expected` plus
   `"recorded": true`.
3. Restart the connectors container with
   `CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX=SUPER_SECRETS_` and run
   `node scripts/record-connectors.mjs --prefix SUPER_SECRETS_` for the prefix case.
4. `cargo test -p bpmnkit-connector-runtime --test replay`: every mismatch is a parity bug in
   the runner (fix it, do not bless). Commit the fixtures.

Limits of the recording: the REST API does not expose a failed job's requested backoff, so
`retryBackOff` keeps the replayed value; response header case and the HTTP error message are
the known open items (see the crate docs, "Deviations").
