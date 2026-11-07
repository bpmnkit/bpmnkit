# Releasing the Rust crates

The `bpmnkit-*` crates under `crates/` are published to crates.io. This page records how they are versioned and released.

## Versioning

- **Lockstep.** All crates share the one `[workspace.package] version` in the root `Cargo.toml`. They are a tightly coupled set (each builds on the others and all are held to the same conformance corpus), so a mix of versions has no meaning.
- **Independent of npm.** The `@bpmnkit/*` packages version independently through changesets. The crates do not follow those numbers (this replaces the "same version as the npm packages" line in `rust-rewrite-proposal.md` section 3).
- **Manual bump, one PR.** To release, change the workspace version and the `version` of every internal dependency in `[workspace.dependencies]` (and the inline `bpmnkit-feel` entries) in the same PR. `node scripts/crates-publish.mjs --check` fails if they disagree; CI runs it.
- **Semver.** While the version is 0.x, a breaking change bumps the minor, anything else the patch.
- **Tag.** Tag the release commit `crates-v<version>` (for example `crates-v0.1.0`).
- **Corpus provenance.** Each release's notes state the `@bpmnkit/core` and `@bpmnkit/feel` versions the conformance corpus under `conformance/` was recorded from (at the time of writing: core 1.9.0, feel 1.1.1).
- **MSRV.** `rust-version = "1.85"` in `[workspace.package]`: the highest value among the resolved dependencies (`indexmap` 2.14 and `hashbrown` 0.17). `clippy::incompatible_msrv` checks the crates' own std usage against it. Raise it only when a dependency requires it, and note it in the release.

`bpmnkit-conformance` (and `bpmnkit-fuzz`) stay `publish = false`.

## Publish order

Dependencies first (`node scripts/crates-publish.mjs --print`):

1. `bpmnkit-spec`
2. `bpmnkit-xml`
3. `bpmnkit-bpmn`
4. `bpmnkit-feel`
5. `bpmnkit-form`
6. `bpmnkit-compat`
7. `bpmnkit-dmn`
8. `bpmnkit-layout`
9. `bpmnkit-lint`
10. `bpmnkit-builder`
11. `bpmnkit-text`

`--publish` skips a crate whose exact version is already on crates.io (sparse index), so a run that stopped half way can be started again.

## Packaging notes

- `bpmnkit-spec` embeds the connector templates from `crates/bpmnkit-spec/data/connectors.json`. That file is a generated, byte-identical copy of `spec/templates/connectors.json`; `node scripts/spec-gen.mjs` writes it and `--check` fails when it is stale.
- Each package excludes `tests/` and `benches/`: they read the shared corpus under `../../conformance`, outside the crate. Cargo prints "ignoring test ... is not included in the published package" warnings for this; they are expected.
- `bpmnkit-feel` is declared inline (`path` plus `version`) in each member rather than in `[workspace.dependencies]`, because `bpmnkit-dmn` needs `default-features = false` and a workspace entry cannot be overridden to `false`.
- The package size limit on crates.io is 10 MB; the largest crate, `bpmnkit-spec`, is about 0.5 MB compressed.

## Workflow

`.github/workflows/release-crates.yml` (manual, `workflow_dispatch`):

1. `verify` job: spec data check, metadata check, `cargo test --workspace`, `cargo publish --dry-run --workspace` (which packages and builds every crate from its `.crate` file).
2. `publish` job, only with the `publish` input set and behind the `crates-io` environment (manual approval): `node scripts/crates-publish.mjs --publish` with `CARGO_REGISTRY_TOKEN`.

Locally: `node scripts/crates-publish.mjs --check | --print | --dry-run [--allow-dirty]`.

## What the maintainer has to do

1. Create a crates.io API token with the `publish-new` and `publish-update` scopes and add it as the secret `CARGO_REGISTRY_TOKEN` of a GitHub environment named `crates-io`. Add required reviewers to that environment.
2. Names: when this was written none of `bpmnkit-spec`, `-xml`, `-bpmn`, `-feel`, `-form`, `-compat`, `-dmn`, `-layout`, `-lint`, `-builder`, `-text` (nor `-conformance`, `-fuzz`) existed in the crates.io sparse index (`https://index.crates.io/bp/mn/<name>` answered 404), so all are free. Re-check just before publishing.
3. First release: bump nothing (0.1.0), run the workflow without `publish`, read the dry-run output, run it again with `publish`, approve, then tag `crates-v0.1.0` and write the release notes (corpus provenance above).
4. Optionally add the `bpmnkit` crates.io owner/team (`cargo owner --add`) after the first publish.
