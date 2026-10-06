# Publishing to npm

How the twenty-six published `@bpmnkit/*` packages reach the registry: the automated
release flow, the gates in front of it, and the one-time setup behind it.

---

## How it works

Releases are fully automated via [Changesets](https://github.com/changesets/changesets) and GitHub Actions. The flow has two stages:

```
PR merged to main
      │
      ▼
changesets/action detects changesets
      │
      ├─── Pending changesets → opens/updates "Version Packages" PR
      │         (bumps versions, updates CHANGELOG)
      │
      └─── No pending changesets, version PR merged → publishes to npm
```

Every merge to `main` triggers the `release.yml` workflow. The `changesets/action` decides what to do:

- **When changesets are present:** creates or updates a "Version Packages" PR that bumps `package.json` versions and updates `CHANGELOG.md`.
- **When the "Version Packages" PR is merged:** runs `pnpm release` which builds and publishes the package to npm with provenance attestation.

---

## First-time setup

### 1. The npm organization

Everything publishes under the [`@bpmnkit`](https://www.npmjs.com/org/bpmnkit) npm
organization, which already exists. A new package needs `publishConfig.access: "public"` in
its manifest — `check-packages.mjs` enforces that — and nothing else.

### 2. Authentication: trusted publishing, no token

`release.yml` holds no npm token. Every package authenticates with
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers): the job's
`id-token: write` permission lets npm exchange a GitHub OIDC token for a short-lived publish
credential. For that to work, each package on npmjs.com must name this repository and
workflow as its trusted publisher.

### 3. Publishing a package for the first time

**A brand-new package cannot be published by the release workflow.** npm can only attach a
trusted publisher to a package that already exists, so the first OIDC publish of a new name
fails with `404 Not Found` (`ERR_PNPM_FAILED_TO_PUBLISH ... status 404`). The other packages
in the same run still publish; the run goes red.

Bootstrap a new package once, by hand, before (or right after) its first version PR merges:

1. Build it: `pnpm turbo build --filter <package>`.
2. Publish it from a maintainer account in the `@bpmnkit` org:
   `pnpm --filter <package> publish --access public --no-git-checks`.
3. On npmjs.com → the package → **Settings** → **Trusted Publisher** → **GitHub Actions**:
   organization `bpmnkit`, repository `monorepo`, workflow filename `release.yml`.
4. Optionally, under **Publishing access**, require 2FA and disallow tokens, as the existing
   packages do.

From then on the package publishes through the automated flow like any other. If the version
PR already merged and the release failed on the new package, re-run the failed Release job
after step 3; changesets skips every version that is already on npm.

The package also needs to be in `scripts/published-packages.mjs` and to have a changeset.

---

## The gates in front of publish

`release.yml` runs these before `changesets/action`, and each one **skips the publish** if it
fails. That is deliberate — a bad tarball is worse than a late one — but it also means a red
release workflow publishes nothing at all and says so nowhere except the Actions tab. If a
merge to `main` did not produce a release, look there first.

| Step | What it catches |
|---|---|
| `pnpm build` | Anything that does not compile |
| `node scripts/sync-license.mjs` | A published package with no LICENSE |
| `node scripts/generate-readmes.mjs` | A hand-edited README about to be overwritten |
| `node scripts/check-packages.mjs` | Missing manifest metadata; a package at 1.0 that is not in `STABLE`; a package in `STABLE` with no tests or documentation page |
| `pnpm check:consumable` | A tarball missing a path its own `exports` declares, declarations that do not compile under `strict` + `NodeNext`, a surviving `workspace:` range |

The last one is the reason it exists: three packages once shipped with no `dist/` because they
had no `files` field, and the metadata checks could not see it. CI runs the fast half
(`--pack-only`) on every pull request; the release workflow runs the whole thing.

---

## Day-to-day workflow

### Adding a changeset (required for every release)

After making changes that should be released, create a changeset:

```bash
pnpm changeset
```

This interactive prompt asks:
- Which packages changed
- Bump type: `patch` (bug fix), `minor` (new feature), `major` (breaking change)
- A short summary of the change

Commit the generated `.changeset/*.md` file alongside your code changes.

### Merging and releasing

1. Open a PR with your changes + the changeset file
2. Merge the PR to `main`
3. The release workflow opens (or updates) a **"chore: version packages"** PR automatically
4. Review the version bump and CHANGELOG, then merge that PR
5. The release workflow runs again and publishes to npm

---

## npm Provenance (Trusted Publishing)

The release workflow is configured for **npm provenance**, which cryptographically links the published package to the exact GitHub Actions workflow run that built it.

### What it does

When `NPM_CONFIG_PROVENANCE=true` is set, npm publishes an [OIDC-based attestation](https://docs.npmjs.com/generating-provenance-statements) alongside the package. Consumers can verify:

- The package was built from `github.com/bpmnkit/monorepo`
- The exact git commit and workflow run that produced it
- The build was not tampered with between CI and the registry

This is visible on the npm package page as a **"Built and signed on GitHub Actions"** badge.

### Why `id-token: write`

The workflow has `permissions: id-token: write`. This allows GitHub Actions to request an OIDC token from GitHub's identity provider, which npm uses to create the provenance attestation. Without this permission, provenance attestation silently fails.

### Verifying provenance

Anyone can verify the provenance of a published package:

```bash
npm audit signatures
# or
npm install --dry-run @bpmnkit/core
```

Or via the npm web UI on the package's **Code** tab.

---

## Workflow permissions summary

| Permission | Why |
|---|---|
| `contents: write` | Changesets action creates version commits |
| `pull-requests: write` | Changesets action opens/updates the Version PR |
| `id-token: write` | npm trusted publishing and provenance attestation |

---

## Troubleshooting

**`404 Not Found` on publish**
- The package has never been published, so it has no trusted publisher yet — see
  [Publishing a package for the first time](#3-publishing-a-package-for-the-first-time).
- Otherwise, check the package's trusted publisher on npmjs.com names `bpmnkit/monorepo`
  and `release.yml`.

**Provenance attestation fails**
- Ensure `permissions: id-token: write` is present in the workflow job.

**Changesets PR not created**
- Verify at least one `.changeset/*.md` file was committed to the branch before merging.
- Check the `GITHUB_TOKEN` has `pull-requests: write` permission (granted automatically by the job-level `permissions` block).
