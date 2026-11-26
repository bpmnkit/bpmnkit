//! Registry hot-load: a new signed version replaces the running one; a bad one is rejected and
//! the running version keeps serving.
mod common;

use std::path::PathBuf;
use std::sync::Arc;

use bpmnkit_wasm_contract::{
    sign, ArtifactMetadata, Digest, DirRegistry, RegistryEntry, RegistryStore, SigningKey,
    ValidManifest,
};
use bpmnkit_wasm_host::{run_job, Event, HotLoadError, MapSecrets, Outcome, Watcher};
use common::*;

fn key(seed: u8) -> SigningKey {
    SigningKey::from_bytes(&[seed; 32])
}

fn root(tag: &str) -> PathBuf {
    let d = std::env::temp_dir().join(format!("bpmnkit-hotload-{tag}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&d);
    d
}

fn entry(body: &str, extra: &str, signer: &SigningKey) -> RegistryEntry {
    entry_with(body, manifest(extra), signer)
}

fn entry_with(body: &str, manifest: ValidManifest, signer: &SigningKey) -> RegistryEntry {
    let wasm = component(body);
    let digest = Digest::of(&wasm);
    RegistryEntry {
        signature: sign(signer, &digest, &manifest),
        metadata: ArtifactMetadata {
            component_digest: digest.clone(),
            source_digest: digest.clone(),
            manifest: manifest.clone(),
            contract_version: "0.1.0".parse().unwrap(),
            sdk_version: "0.1.0".parse().unwrap(),
            toolchain: "test".into(),
            lock_digest: digest,
        },
        wasm,
        manifest,
    }
}

fn start(root: &PathBuf) -> (Watcher<DirRegistry>, Vec<Event>) {
    Watcher::start(
        engine(),
        DirRegistry::new(root),
        key(1).verifying_key(),
        &["t".to_string()],
        Arc::new(MapSecrets::default()),
    )
}

async fn outcome(w: &Watcher<DirRegistry>) -> Outcome {
    let h = &w.handlers()[0];
    run_job(&h.loaded(), job("{}"), &MapSecrets::default()).await
}

#[tokio::test]
async fn swaps_to_a_new_signed_digest() {
    let r = root("swap");
    let reg = DirRegistry::new(&r);
    let v1 = reg.publish(&entry(ECHO, "", &key(1))).unwrap();
    let (mut w, ev) = start(&r);
    assert!(
        matches!(&ev[..], [Event::Loaded { digest, .. }] if *digest == v1),
        "{ev:?}"
    );
    assert!(matches!(outcome(&w).await, Outcome::Complete(_)));
    assert!(w.poll().is_empty(), "unchanged CURRENT is a no-op");

    let v2 = reg.publish(&entry(THROW, "", &key(1))).unwrap();
    let ev = w.poll();
    assert!(
        matches!(&ev[..], [Event::Swapped { from, to, .. }] if *from == v1 && *to == v2),
        "{ev:?}"
    );
    assert_eq!(w.handlers()[0].loaded().digest, v2);
    assert!(matches!(outcome(&w).await, Outcome::ThrowError(_)));
    let _ = std::fs::remove_dir_all(&r);
}

#[tokio::test]
async fn bad_signature_keeps_the_previous_version() {
    let r = root("sig");
    let reg = DirRegistry::new(&r);
    let v1 = reg.publish(&entry(ECHO, "", &key(1))).unwrap();
    let (mut w, _) = start(&r);
    let bad = reg.publish(&entry(THROW, "", &key(2))).unwrap();
    let ev = w.poll();
    assert!(
        matches!(&ev[..], [Event::Rejected { digest: Some(d), error: HotLoadError::Signature(_), .. }] if *d == bad),
        "{ev:?}"
    );
    assert!(ev[0].to_string().contains("previous version keeps serving"));
    assert_eq!(w.handlers()[0].loaded().digest, v1);
    assert!(matches!(outcome(&w).await, Outcome::Complete(_)));
    assert!(w.poll().is_empty(), "a rejected digest is reported once");

    // A later good version is still picked up.
    let v3 = reg.publish(&entry(FAIL, "", &key(1))).unwrap();
    assert!(matches!(&w.poll()[..], [Event::Swapped { to, .. }] if *to == v3));
    let _ = std::fs::remove_dir_all(&r);
}

#[tokio::test]
async fn tampered_wasm_is_rejected() {
    let r = root("tamper");
    let reg = DirRegistry::new(&r);
    let v1 = reg.publish(&entry(ECHO, "", &key(1))).unwrap();
    let (mut w, _) = start(&r);
    let v2 = reg.publish(&entry(THROW, "", &key(1))).unwrap();
    // Swap in another component after signing: same digest directory, different bytes.
    std::fs::write(
        r.join("t").join(v2.as_hex()).join("worker.wasm"),
        component(TRAP),
    )
    .unwrap();
    let ev = w.poll();
    assert!(
        matches!(
            &ev[..],
            [Event::Rejected {
                error: HotLoadError::Digest { .. },
                ..
            }]
        ),
        "{ev:?}"
    );
    assert_eq!(w.handlers()[0].loaded().digest, v1);
    let _ = std::fs::remove_dir_all(&r);
}

#[test]
fn tampered_manifest_and_job_type_changes_are_rejected() {
    let r = root("manifest");
    let reg = DirRegistry::new(&r);
    reg.publish(&entry(ECHO, "", &key(1))).unwrap();
    let (mut w, _) = start(&r);

    // An edited worker.toml no longer matches metadata.json (and the signature).
    let v2 = reg.publish(&entry(THROW, "", &key(1))).unwrap();
    let dir = r.join("t").join(v2.as_hex());
    let toml = std::fs::read_to_string(dir.join("worker.toml")).unwrap();
    std::fs::write(dir.join("worker.toml"), toml.replacen("0.1.0", "0.1.1", 1)).unwrap();
    let ev = w.poll();
    assert!(
        matches!(
            &ev[..],
            [Event::Rejected {
                error: HotLoadError::Metadata(_),
                ..
            }]
        ),
        "{ev:?}"
    );

    let other = ValidManifest::from_toml(
        "[worker]\nname=\"t\"\nversion=\"0.2.0\"\njob_types=[\"other\"]\n",
    )
    .unwrap();
    reg.publish(&entry_with(FAIL, other, &key(1))).unwrap();
    let ev = w.poll();
    assert!(
        matches!(
            &ev[..],
            [Event::Rejected {
                error: HotLoadError::JobTypes { .. },
                ..
            }]
        ),
        "{ev:?}"
    );
    let _ = std::fs::remove_dir_all(&r);
}

#[test]
fn start_skips_unverifiable_workers() {
    let r = root("start");
    DirRegistry::new(&r)
        .publish(&entry(ECHO, "", &key(2)))
        .unwrap();
    let (w, ev) = start(&r);
    assert!(w.handlers().is_empty());
    assert!(matches!(&ev[..], [Event::Rejected { .. }]), "{ev:?}");
    assert_eq!(
        bpmnkit_wasm_host::registry_workers(&r).unwrap(),
        ["t".to_string()]
    );
    let _ = std::fs::remove_dir_all(&r);
}
