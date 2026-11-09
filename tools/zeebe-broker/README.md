# zeebe-broker

Deploys the conformance corpus to a real Camunda 8 engine. `.github/workflows/zeebe-broker-nightly.yml` runs it every night for 8.6, 8.7, 8.8 and the latest (8.10). It complements [`tools/zeebe-check`](../zeebe-check/README.md), which runs only Zeebe's `BpmnValidator`. A broker also decides these checks, which `BpmnValidator` does not:

- the straight-through-loop check (Z35);
- `bindingType="deployment"` targets (Z111, Z118, Z130, Z136);
- duplicate process ids across the resources of one deployment (Z183);
- what the transformer rejects.

## What it deploys and expects

`scripts/zeebe-broker-check.mjs` sends one `POST /v2/deployments` per item:

| Item | Expectation |
| --- | --- |
| Every `conformance/{builder,text,compact,bpmn}` output | Deploys, unless `case.json` says `deployable: false` or `doc/deployability/known-undeployable.json` lists it. |
| `doc/deployability/repro/*.bpmn` | Rejected with the errors in `expected-verdicts.json`. Skipped when the rule's `since` (in `spec/zeebe-rules.json`) is newer than the engine. |
| `doc/deployability/broker-repro/deployments.json` | Multi-resource and runtime-only cases, each with `ok` and the text the rejection must `contain`. |

The outcome of each item is one of four values:

- **pass**
- **fail**, a mismatch. Mismatches set exit code 1 and go to `mismatches.json`.
- **info**, which does not fail the run:
  - a deployable file is rejected by an older engine than its `executionPlatformVersion`;
  - an allowlisted case is accepted.
- **skip**

The script waits for `/v2/topology` to show a healthy leader, up to `--ready-timeout` seconds (default 300). Network errors, 408, 429 and 5xx answers are retried with backoff. Results go to `--out`:

- `results.json`
- `mismatches.json`
- `summary.md`, also written to the job summary.

## Run it locally

```sh
cd tools/zeebe-broker
CAMUNDA_VERSION=8.10.9 docker compose up -d --wait camunda      # 8.8 and newer
# ZEEBE_VERSION=8.6.42 docker compose --profile legacy up -d --wait zeebe   # 8.6 / 8.7
cd ../..
node scripts/zeebe-broker-check.mjs --version 8.10.9 --out zeebe-broker-check
docker compose -f tools/zeebe-broker/docker-compose.yml down
```

If the engine needs basic auth, set `ZEEBE_REST_USER` and `ZEEBE_REST_PASSWORD`. The script is tested against a mock engine in `scripts/zeebe-broker-check.test.mjs` (`pnpm test:scripts`).
