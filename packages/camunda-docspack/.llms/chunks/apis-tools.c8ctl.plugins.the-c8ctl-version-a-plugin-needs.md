# Extend c8ctl with plugins — The c8ctl version a plugin needs

The plugin runtime grows over time — `c8ctl.npm()`, for instance, does not exist in every published c8ctl. A plugin that uses a newer runtime API declares the floor it needs in its own `package.json`:

```json
{
  "name": "c8ctl-plugin-example",
  "engines": {
    "c8ctl": ">=4.0.0-alpha.1"
  }
}
```

The field is optional — a plugin that declares nothing is treated exactly as it was before. When it *is* declared and this c8ctl does not satisfy it:

- `c8 load plugin`, `c8 upgrade plugin`, and `c8 downgrade plugin` **fail** instead of reporting success. The plugin is still installed; what you don't get is a green exit code on an install that cannot work. (Pinning an older release is the likeliest way to land on one built for an older c8ctl, so `downgrade` matters most here.)
- The plugin still loads and still appears in `c8 help`, but every one of its commands refuses to run and prints which c8ctl it needs. A visible command that explains itself beats a missing one that reads as a typo.
- `c8 doctor plugin` lists it under incompatible plugins, in text and in `--json`.

Range evaluation is npm's own `semver` — the same library `npm install` uses for `engines` fields — so the full range grammar is supported: comparators (`>=`, `>`, `<=`, `<`, `^`, `~`, an exact version, `*`), set unions (`"^3 || ^4"`), hyphen ranges (`"3.3.0 - 4.0.0"`), and partial or wildcard versions (`"4"`, `"4.x"`). Prereleases order as semver specifies, so `>=4.0.0` is *not* satisfied by `4.0.0-alpha.1` — declare `>=4.0.0-alpha.1` when an alpha is enough — and `^`/`~` exclude prereleases of the version they bound (`^4.1.0` does not admit `5.0.0-alpha.1`).

**Prereleases count.** Unlike `npm install`, which excludes prerelease versions from a range unless you opt in, this check treats them as ordinary versions: a host on `4.1.0-alpha.3` satisfies `>=4.0.0-alpha.1`. That is deliberate — c8ctl publishes alphas, and refusing to run a plugin on the very channel its requirement was written for would disable working setups. One consequence to know: `^`/`~` still desugar the way npm does, to an upper bound that excludes prereleases (`^4.1.0` means `>=4.1.0 <5.0.0-0`), while a hand-written `<5.0.0` means exactly what it says and does admit `5.0.0-alpha.1`. Spell the bound explicitly if that distinction matters to your plugin.

Two cases deliberately disable nothing, because c8ctl could not evaluate the requirement rather than having found it unmet:

- c8ctl running from an unpublished development build, whose version says nothing about its API surface.
- A range c8ctl cannot parse (`"latest"`, `">=four"`), which is reported as a warning pointing at npm's semver range syntax.

To resolve a genuine incompatibility, either upgrade c8ctl (`npm install -g @camunda8/cli@latest`) or install a plugin release that supports the c8ctl you have.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
