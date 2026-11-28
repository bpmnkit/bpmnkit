# @crates/bpmnkit-spec

## 0.9.1

## 0.9.0

## 0.8.0

## 0.7.2

## 0.7.1

## 0.7.0

## 0.6.1

## 0.6.0

## 0.5.0

## 0.4.0

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
