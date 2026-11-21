# First release of the native CLI: one-time setup

What a maintainer must do once, on npmjs.com, crates.io and GitHub, before the first release of the
native `bpmnkit` CLI and the new crates. Do the steps in order. Status as of 2026-11-21.

## What is new on each registry

| Registry | Name | Exists | Published by |
|---|---|---|---|
| npm | `@bpmnkit/cli` | yes (1.9.3, the old Node CLI) | `release-cli.yml` (was `release.yml`) |
| npm | `@bpmnkit/cli-linux-x64`, `-linux-arm64`, `-darwin-x64`, `-darwin-arm64`, `-win32-x64` | no | `release-cli.yml` |
| npm | `@bpmnkit/cli-legacy`, `@bpmnkit/create-bpmnkit-plugin` | no | `release.yml` (Changesets) |
| crates.io | `bpmnkit-worker`, `-cli`, `-codegen`, `-connector-runtime`, `-connectors`, `-jobspec`, `-profiles` | no | `release-crates.yml` |

npm publishing uses trusted publishing (OIDC) only; there is no npm token in the workflows. npm can
trust a workflow only for a package that already exists, so each new npm name needs one manual
publish first. crates.io has the same rule, but `release-crates.yml` handles it itself (see step 3).

## 1. npm: create the 7 new packages (placeholder `0.0.0`)

On a machine that is logged in to npm as an owner of the `@bpmnkit` scope (`npm whoami`), with 2FA
at hand. The packages in the tree are `private`, so publish a minimal placeholder instead:

```bash
for name in cli-linux-x64 cli-linux-arm64 cli-darwin-x64 cli-darwin-arm64 cli-win32-x64 cli-legacy create-bpmnkit-plugin; do
  dir=$(mktemp -d)
  printf '{"name":"@bpmnkit/%s","version":"0.0.0","description":"Placeholder; the first real release follows.","license":"MIT","repository":{"type":"git","url":"git+https://github.com/bpmnkit/bpmnkit.git"}}\n' "$name" > "$dir/package.json"
  (cd "$dir" && npm publish --access public --tag placeholder)
done
```

`--tag placeholder` keeps `0.0.0` off `latest`. Nothing installs it: the launcher asks for the
platform packages at an exact version (2.0.0).

## 2. npm: register the trusted publishers

For each package, on npmjs.com: package page → **Settings** → **Trusted publisher** → **GitHub
Actions**. Organization `bpmnkit`, repository `bpmnkit`, environment empty, and this workflow:

| Package | Workflow filename |
|---|---|
| `@bpmnkit/cli` (change the existing entry) | `release-cli.yml` |
| the five `@bpmnkit/cli-<platform>` packages | `release-cli.yml` |
| `@bpmnkit/cli-legacy`, `@bpmnkit/create-bpmnkit-plugin` | `release.yml` |

`@bpmnkit/cli` today trusts `release.yml`. If it is not changed, the launcher publish fails with a
403. Optional, afterwards: **Publishing access** → "Require two-factor authentication and disallow
tokens" on each new package.

## 3. crates.io: check the bootstrap token

`release-crates.yml` publishes new crates with the `CARGO_REGISTRY_TOKEN` secret, then registers
itself as each crate's trusted publisher. Later runs use OIDC only.

- GitHub → repository **Settings** → **Environments** → `crates-io` → the secret
  `CARGO_REGISTRY_TOKEN` must exist. If it was removed after the 0.1.0 bootstrap, create a new token
  on crates.io (**Account Settings** → **API Tokens**) with the scopes `publish-new`,
  `publish-update` and `trusted-publishing`, and add it there.
- The 7 new names are free on crates.io today. crates.io allows only a short burst of new crates,
  then about one every 10 minutes; the run waits and retries, so expect about an hour.
- After that run: remove the secret again or keep it for the next new crate
  (`doc/rust-crates-release.md`, "What the maintainer has to do").

## 4. Homebrew

- The repository `bpmnkit/homebrew-tap` must exist (public, default branch `main`). Create it
  empty if it does not.
- Create a fine-grained GitHub token with access to that repository only and **Contents: read and
  write**. Add it to `bpmnkit/bpmnkit` as the repository secret `HOMEBREW_TAP_TOKEN` (**Settings** →
  **Secrets and variables** → **Actions**).

## 5. Release, in this order

`@bpmnkit/cli` 2.0 depends on `@bpmnkit/cli-legacy`, so the Changesets release must come first.

1. Merge the PR. Changesets opens a "Version Packages" PR.
2. Merge "Version Packages". `release.yml` publishes `@bpmnkit/cli-legacy`,
   `@bpmnkit/create-bpmnkit-plugin` and the other npm packages. `release-crates.yml` starts:
   approve the `crates-io` environment and wait for the run to finish.
3. Check `npm view @bpmnkit/cli-legacy version` shows the new version (not `0.0.0`).
4. Tag the native CLI with the version of the `bpmnkit-cli` crate (`version` in the root
   `Cargo.toml` after step 2), for example:

   ```bash
   git tag bpmnkit-cli-v0.7.0 && git push origin bpmnkit-cli-v0.7.0
   ```

   `release-cli.yml` builds the binaries, creates the GitHub release with the installers, pushes the
   Homebrew formula and publishes the five platform packages and `@bpmnkit/cli` 2.0.0 under the
   dist-tag `next`. `latest` stays at 1.9.3.
5. Try it: `npx @bpmnkit/cli@next --version`, `brew install bpmnkit/tap/bpmnkit-cli`, and the shell
   installer from the GitHub release.
6. When it works, make 2.0 the default:

   ```bash
   npm dist-tag add @bpmnkit/cli@2.0.0 latest
   ```

If `publish-npm` stops part way, the packages it already published cannot be published again at
the same version: re-run only after you bump the versions, or publish the rest by hand.
