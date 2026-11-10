# Embedded font

`Inter-Regular-subset.otf` and `Inter-Bold-subset.otf` are subsets of [Inter](https://github.com/rsms/inter)
(SIL Open Font License 1.1, see `OFL.txt`), bundled by the `embedded-font` feature so PNGs look the
same on every machine. They live in the crate so `cargo publish` packages them.

Coverage: Basic Latin, Latin-1, Latin Extended-A, common punctuation, €, ™, arrows. Rebuild with
fonttools from Inter 4.0:

```sh
pyftsubset Inter-Regular.otf --unicodes="U+0020-007E,U+00A0-017F,U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2193,U+2212" \
  --layout-features="kern,liga,calt" --no-hinting --desubroutinize --name-IDs="*" \
  --output-file=Inter-Regular-subset.otf
```
