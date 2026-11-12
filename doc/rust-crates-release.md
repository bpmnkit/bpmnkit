# Releasing the Rust crates

The `bpmnkit-*` crates under `crates/` are published to crates.io. This page records how they are versioned and released.

## Versioning

- **Changesets, same UX as npm.** Each crate has a private `crates/<crate>/package.json` shell named `@crates/<crate>` (version 0.2.0 at the switch). A changeset (`pnpm changeset`) names `@crates/<crate>` like any `@bpmnkit/*` package; the "Version Packages" PR bumps the shell's `package.json`, writes `crates/<crate>/CHANGELOG.md`, and `scripts/crates-version.mjs` copies the new version into `Cargo.toml` (`[workspace.package]` plus the internal dependency requirements). `node scripts/crates-publish.mjs --check` fails if the two disagree; CI runs it.
- **Lockstep.** All crates share one version: they are one `fixed` group in `.changeset/config.json`, so a changeset for any crate bumps all of them to the same number. They are a tightly coupled set (each builds on the others and all are held to the same conformance corpus), so a mix of versions has no meaning.
- **Independent of npm.** The `@bpmnkit/*` packages version independently. The crates do not follow those numbers (this replaces the "same version as the npm packages" line in `rust-rewrite-proposal.md` section 3).
- **Changeset required.** `scripts/changeset-check.mjs` (CI) fails when a crate's `src/**`, `build.rs` or `Cargo.toml` changed and no changeset names `@crates/<crate>`. Tests, benches, examples, scripts and Markdown do not need one.
- **Semver.** While the version is 0.x, a breaking change is a `minor` changeset, anything else `patch`.
- **Tag and release.** One tag and one GitHub release `crates-v<version>` per version, created by `node scripts/crates-publish.mjs --release` after the publish. The notes are the `## <version>` sections of the crates' CHANGELOGs (the `bpmnkit` facade first, empty sections skipped) plus the corpus provenance line.
- **Corpus provenance.** Each release's notes state the `@bpmnkit/core` and `@bpmnkit/feel` versions the conformance corpus under `conformance/` was recorded from; `--release` reads them from `packages/core` and `packages/feel`.
- **MSRV.** `rust-version = "1.85"` in `[workspace.package]`: the highest value among the resolved runtime dependencies (`indexmap` 2.14 and `hashbrown` 0.17). The `msrv-rs` CI job runs `cargo check --workspace --all-targets` and `cargo test --workspace` on exactly that toolchain (it reads the version from `Cargo.toml`). The one dependency that needed more was `proptest` 1.12 (Rust 1.88), a dev-dependency of the unpublished `bpmnkit-fuzz`; the lockfile pins 1.11, and `.cargo/config.toml` sets `resolver.incompatible-rust-versions = "fallback"` so `cargo update` keeps picking versions that support the MSRV. `clippy::incompatible_msrv` checks the crates' own std usage against it. Raise it only when a runtime dependency requires it, and note it in the release.

`bpmnkit-conformance` (and `bpmnkit-fuzz`) stay `publish = false`.

## The `bpmnkit` facade

`crates/bpmnkit` re-exports the 11 crates as modules (`bpmnkit::feel`, `bpmnkit::bpmn`, …), each behind a cargo feature named after it. Defaults: `feel`, `bpmn`, `dmn`, `form` (read, write and evaluate models); `full` turns on all 11. Its README is also its crate-level rustdoc (feature table and a doctested example).

`node scripts/crates-publish.mjs --check` fails when a published crate is missing from the facade's dependencies, so a new crate cannot ship without a way in through it. CI and the release workflow check the facade with no features and with each feature on its own (`node scripts/crates-publish.mjs --check-features`).

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
12. `bpmnkit` (the facade; it depends on all of the above, so it is always last)

`--publish` skips a crate whose exact version is already on crates.io (sparse index), so a run that stopped half way can be started again. crates.io allows only a short burst of new crates, then about one per 10 minutes; on a 429 `--publish` waits until the time crates.io names and retries (up to 20 times per crate), so a bootstrap run with many new crates takes longer but finishes.

## Packaging notes

- `bpmnkit-spec` embeds the connector templates from `crates/bpmnkit-spec/data/connectors.json`. That file is a generated, byte-identical copy of `spec/templates/connectors.json`; `node scripts/spec-gen.mjs` writes it and `--check` fails when it is stale.
- `bpmnkit-viewer` embeds the viewer-lite browser assets from `crates/bpmnkit-viewer/assets/` (the minified viewer, the open/drop script and the CSS). They are generated copies of the `@bpmnkit/viewer-lite` build; `node scripts/viewer-assets.mjs` writes them together with the golden pages its parity test compares, and `--check` (CI, `verify:rust`) fails when they are stale. Run `pnpm --filter @bpmnkit/viewer-lite build` first.
- Each package excludes `tests/` and `benches/`: they read the shared corpus under `../../conformance`, outside the crate. Cargo prints "ignoring test ... is not included in the published package" warnings for this; they are expected.
- `bpmnkit-feel` is declared inline (`path` plus `version`) in each member rather than in `[workspace.dependencies]`, because `bpmnkit-dmn` needs `default-features = false` and a workspace entry cannot be overridden to `false`.
- `cargo package -p bpmnkit` on its own fails until its dependencies are on crates.io ("no matching package named `bpmnkit-bpmn`"). Package the set together instead: `cargo package --workspace --exclude bpmnkit-conformance --exclude bpmnkit-fuzz` (or `node scripts/crates-publish.mjs --dry-run`), which resolves each crate against the others' local `.crate` files and verifies all 12.
- Sizes. crates.io rejects a `.crate` over 10 MB; every crate is far below it. Measured on 2026-11-08 with `cargo package` (cargo 1.97):

  | Crate | Files | Unpacked | `.crate` (compressed) |
  |---|---|---|---|
  | `bpmnkit-spec` (embeds `connectors.json`) | 21 | 3.7 MiB | 536 KiB |
  | `bpmnkit-layout` | 33 | 385 KiB | 100 KiB |
  | `bpmnkit-feel` | 25 | 346 KiB | 83 KiB |
  | `bpmnkit-compat` | 20 | 350 KiB | 82 KiB |
  | `bpmnkit-text` | 25 | 305 KiB | 79 KiB |
  | `bpmnkit-lint` | 30 | 313 KiB | 75 KiB |
  | `bpmnkit-builder` | 19 | 256 KiB | 56 KiB |
  | `bpmnkit-bpmn` | 19 | 257 KiB | 52 KiB |
  | `bpmnkit-dmn` | 13 | 99 KiB | 27 KiB |
  | `bpmnkit-form` | 12 | 78 KiB | 19 KiB |
  | `bpmnkit` (facade) | 9 | 44 KiB | 14 KiB |
  | `bpmnkit-xml` | 8 | 33 KiB | 11 KiB |

  `connectors.json` is most of `bpmnkit-spec`; it would have to grow about 18-fold before the limit matters.

## Security advisories

CI's Rust job runs `cargo audit --deny warnings` on the root `Cargo.lock`, so a RustSec advisory, an unmaintained or a yanked crate fails the build. A lockfile bump fixes CI only: also raise the requirement in `Cargo.toml` so that users of the published crates cannot resolve the affected version, and keep it within `rust-version` (`cargo info <crate>@<version>` shows a crate's MSRV).

The `Reebe` workflow runs the same check on `apps/reebe/Cargo.lock`, a separate workspace. Its one accepted advisory is in `apps/reebe/.cargo/audit.toml`, with the reason: `libsqlite3-sys` RUSTSEC-2026-0459 (patched in 0.39, but `sqlx-sqlite` 0.9.0 requires `<0.38`; reebe opens only its own database file). Remove the ignore once an sqlx release allows 0.39.

## Workflow

`.github/workflows/release-crates.yml`. It starts on a push to `main` that touches `crates/*/package.json` (the merge of the Version Packages PR) and publishes; started by hand (`workflow_dispatch`) it is a dry run unless `publish` is set:

1. `verify` job: spec data check, metadata check, `cargo test --workspace`, the facade's features one by one, `cargo publish --dry-run --workspace` (which packages and builds every crate, the facade included, from its `.crate` file).
2. `publish` job, only with the `publish` input set or on a push, and behind the `crates-io` environment (manual approval), with `id-token: write`:
   1. **New crates.** `node scripts/crates-publish.mjs --print-new` lists the crates with no version in the sparse index (`index.crates.io`). Any listed → the run is a *bootstrap* run.
   2. **Normal run (nothing new):** `rust-lang/crates-io-auth-action@v1` trades the job's OIDC token for a short-lived crates.io token (output `token`, revoked when the job ends), and `--publish` uses it. The `CARGO_REGISTRY_TOKEN` secret is not read.
   3. **Bootstrap run:** crates.io can trust a workflow only for a crate that already exists, so `--publish` uses the `CARGO_REGISTRY_TOKEN` secret. Then `--trust` registers this workflow as the trusted publisher of every crate (`POST /api/v1/trusted_publishing/github_configs`: owner `bpmnkit`, repo `bpmnkit`, workflow `release-crates.yml`, environment `crates-io`). It skips a crate that already has that config, so it is safe to repeat. It needs the token's `trusted-publishing` scope.

   After `--publish`, **Tag and release** runs `--release` (job permission `contents: write`): if the tag `crates-v<V>` is absent it is created and pushed, then `gh release create` publishes the notes. A tag or release that already exists is skipped, so a rerun is safe.

   The guard is per run, not per crate: one new crate makes the whole run use the secret. That keeps one token per step, and the next run is OIDC again.

Locally: `node scripts/crates-publish.mjs --check | --print | --check-features | --dry-run [--allow-dirty] | --print-new`, and `CARGO_REGISTRY_TOKEN=… node scripts/crates-publish.mjs --trust` to register the trusted publishers by hand.

## What the maintainer has to do

1. Create a crates.io API token with the `publish-new`, `publish-update` and `trusted-publishing` scopes and add it as the secret `CARGO_REGISTRY_TOKEN` of a GitHub environment named `crates-io`. Add required reviewers to that environment. (Done.)
2. Names: re-check just before a release that adds a crate that the name is free (`https://index.crates.io/bp/mn/<name>` answers 404).
3. First release under changesets (0.2.0): merge the PR that adds the package.json shells. The push touches `crates/*/package.json`, so the workflow starts; approve the `crates-io` environment. Its `--release` step creates the first tag `crates-v0.2.0` and its release (no `crates-v0.1.0` tag exists). The manual 0.1.0 flow was: run the workflow without `publish`, read the dry-run output, run it again with `publish` and approve. It is a bootstrap run: it publishes with the secret (12 crates, `bpmnkit` last) and registers the trusted publishers. On 2026-11-08, `bpmnkit-spec`, `-xml`, `-bpmn`, `-feel` and `-form` 0.1.0 were already on crates.io, so the next run publishes the other 7 and registers all 12. Then tag and write the notes by hand.
4. Check on crates.io (each crate → Settings → Trusted Publishing) that the GitHub config is listed. If `--trust` failed (for example, the token lacks the scope), add it there by hand: owner `bpmnkit`, repository `bpmnkit`, workflow `release-crates.yml`, environment `crates-io`, or rerun `--trust` locally.
5. From then on, releases use OIDC only. Optionally, once every crate trusts the workflow, turn on "trusted publishing only" for each crate on crates.io, and reduce the secret to what bootstrap runs need (or remove it until a new crate is added; a bootstrap run without it fails with a clear error).
6. A later release that adds a crate is a bootstrap run again; it registers the new crate.
7. Optionally add the `bpmnkit` crates.io owner/team (`cargo owner --add`) after the first publish.
