#![cfg(feature = "inspect")]
use bpmnkit_wasm_contract::*;

fn manifest(net: bool) -> ValidManifest {
    let n = if net {
        "[network]\nallow=[\"api.example.com:443\"]"
    } else {
        ""
    };
    ValidManifest::from_toml(&format!(
        "[worker]\nname=\"w\"\nversion=\"0.1.0\"\njob_types=[\"w\"]\n{n}"
    ))
    .unwrap()
}

/// A component importing each interface as an (empty) instance and exporting `handle`.
fn component(imports: &[&str], export_handle: bool) -> Vec<u8> {
    let mut s = String::from("(component\n");
    for i in imports {
        s += &format!("  (import \"{i}\" (instance))\n");
    }
    if export_handle {
        s += "  (core module $m (func (export \"h\")))\n  (core instance $i (instantiate $m))\n  (func $h (canon lift (core func $i \"h\")))\n  (export \"handle\" (func $h))\n";
    }
    s += ")";
    wat::parse_str(s).unwrap()
}

const SECRETS: &str = "bpmnkit:worker/secrets@0.1.0";
const LOG: &str = "bpmnkit:worker/log@0.1.0";

#[test]
fn reads_imports_and_exports() {
    let info = inspect(&component(&[SECRETS, LOG], true)).unwrap();
    assert_eq!(info.imports, [SECRETS, LOG]);
    assert_eq!(info.exports, ["handle"]);
}

#[test]
fn plain_component_passes() {
    let info = inspect(&component(
        &[SECRETS, LOG, "wasi:io/error@0.2.0", "wasi:cli/stdout@0.2.0"],
        true,
    ))
    .unwrap();
    assert!(verify(&info, &manifest(false)).is_ok());
}

#[test]
fn http_without_allow_list_fails() {
    let info = inspect(&component(
        &[SECRETS, "wasi:http/outgoing-handler@0.2.0"],
        true,
    ))
    .unwrap();
    let v = verify(&info, &manifest(false)).unwrap_err();
    assert_eq!(
        v,
        [Violation::HttpWithoutAllowList(
            "wasi:http/outgoing-handler@0.2.0".into()
        )]
    );
    assert!(verify(&info, &manifest(true)).is_ok());
}

#[test]
fn unknown_import_fails() {
    for bad in [
        "wasi:sockets/tcp@0.2.0",
        "evil:thing/x@1.0.0",
        "bpmnkit:worker/secrets@9.0.0",
    ] {
        let info = inspect(&component(&[bad], true)).unwrap();
        assert_eq!(
            verify(&info, &manifest(true)).unwrap_err(),
            [Violation::UnknownImport(bad.into())]
        );
    }
}

#[test]
fn missing_handle_fails() {
    let info = inspect(&component(&[SECRETS], false)).unwrap();
    assert_eq!(
        verify(&info, &manifest(false)).unwrap_err(),
        [Violation::MissingExport("handle")]
    );
}

#[test]
fn core_module_and_garbage_rejected() {
    assert!(inspect(&wat::parse_str("(module)").unwrap()).is_err());
    assert!(inspect(b"nope").is_err());
}
