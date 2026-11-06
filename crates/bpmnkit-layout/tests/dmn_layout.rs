//! `layout_dmn` against TS `serializeDmn(layoutDmn(parseDmn(xml)))` for every
//! non-error conformance DMN (expected XML in fixtures/dmn_layout).

use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use bpmnkit_layout::layout_dmn;
use std::path::Path;

#[test]
fn layout_dmn_matches_ts_serialization() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let fixtures = root.join("tests/fixtures/dmn_layout");
    let mut checked = 0;
    for entry in std::fs::read_dir(&fixtures).unwrap() {
        let path = entry.unwrap().path();
        let name = path.file_stem().unwrap().to_str().unwrap().to_string();
        let input = root
            .join("../../conformance/dmn")
            .join(&name)
            .join("input.dmn");
        let xml = std::fs::read_to_string(&input).unwrap();
        let expected = std::fs::read_to_string(&path).unwrap();
        let defs = parse_dmn(&xml).unwrap_or_else(|e| panic!("{name}: {e:?}"));
        // Compared as XML: a NaN in some fixtures breaks `PartialEq` on the model.
        let before = serialize_dmn(&defs);
        let laid_out = layout_dmn(&defs);
        assert_eq!(
            serialize_dmn(&defs),
            before,
            "{name}: input must stay untouched"
        );
        assert_eq!(serialize_dmn(&laid_out), expected, "{name}");
        checked += 1;
    }
    assert!(checked >= 20, "only {checked} fixtures");
}
