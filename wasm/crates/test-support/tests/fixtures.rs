use bpmnkit_wasm_contract::{inspect, verify, world_for, ValidManifest, World};
use bpmnkit_wasm_test_support::{build_fixture, fixture_dir, fixture_manifest, FIXTURES};
use std::fs;

#[test]
#[ignore = "needs wasm32-wasip2"]
fn every_fixture_builds_and_matches_its_manifest() {
    for name in FIXTURES {
        let manifest = ValidManifest::from_toml(&fixture_manifest(name))
            .unwrap_or_else(|e| panic!("{name}: {e:?}"));
        let info = inspect(&fs::read(build_fixture(name)).unwrap()).unwrap();
        verify(&info, &manifest).unwrap_or_else(|v| panic!("{name}: {v:?}"));

        // `wit-component` keeps only used imports, so the world follows the code.
        let http = info.imports.iter().any(|i| i.starts_with("wasi:http/"));
        let world = if http {
            World::WorkerHttp
        } else {
            World::Worker
        };
        assert_eq!(
            world,
            world_for(&manifest),
            "{name}: imports {:?}",
            info.imports
        );
        assert_eq!(info.exports, ["handle"], "{name}");
    }
}

#[test]
#[ignore = "needs wasm32-wasip2"]
fn secret_and_log_imports_follow_use() {
    let imports = |n| {
        inspect(&fs::read(build_fixture(n)).unwrap())
            .unwrap()
            .imports
    };
    let has = |n, p: &str| imports(n).iter().any(|i| i.starts_with(p));
    assert!(has("secret", "bpmnkit:worker/secrets@"));
    assert!(!has("echo", "bpmnkit:worker/secrets@"));
    assert!(has("echo", "bpmnkit:worker/log@"));
    // std pulls WASI 0.2.x too; wit-component unifies to the highest minor.
    assert!(!has("echo", "wasi:http/"));
    assert!(
        has("http-get", "wasi:http/outgoing-handler@0.2."),
        "{:?}",
        imports("http-get")
    );
}

#[test]
#[ignore = "needs wasm32-wasip2"]
fn fixture_dir_has_the_host_layout() {
    let dir = fixture_dir("echo");
    assert_eq!(
        fs::read(dir.join("worker.wasm")).unwrap(),
        fs::read(build_fixture("echo")).unwrap()
    );
    assert_eq!(
        fs::read_to_string(dir.join("worker.toml")).unwrap(),
        fixture_manifest("echo")
    );
}
