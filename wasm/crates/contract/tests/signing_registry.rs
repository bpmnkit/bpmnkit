#![cfg(feature = "registry")]
use bpmnkit_wasm_contract::*;

fn manifest(version: &str) -> ValidManifest {
    ValidManifest::from_toml(&format!(
        "[worker]\nname=\"w\"\nversion=\"{version}\"\njob_types=[\"w\"]"
    ))
    .unwrap()
}
fn key(seed: u8) -> SigningKey {
    signing_key_from_hex(&encode_hex(&[seed; 32])).unwrap()
}
fn entry(wasm: &[u8], version: &str, k: &SigningKey) -> RegistryEntry {
    let manifest = manifest(version);
    let d = Digest::of(wasm);
    RegistryEntry {
        wasm: wasm.to_vec(),
        metadata: ArtifactMetadata {
            component_digest: d.clone(),
            source_digest: Digest::of(b"src"),
            manifest: manifest.clone(),
            contract_version: CONTRACT_VERSION.parse().unwrap(),
            sdk_version: "0.1.0".parse().unwrap(),
            toolchain: "rustc test".into(),
            lock_digest: Digest::of(b"lock"),
        },
        signature: sign(k, &d, &manifest),
        manifest,
    }
}

#[test]
fn sign_verify_round_trip_via_hex_keys() {
    let k = key(7);
    let pubkey =
        verifying_key_from_hex(&format!("{}\n", encode_hex(k.verifying_key().as_bytes()))).unwrap();
    let (d, m) = (Digest::of(b"a"), manifest("0.1.0"));
    let sig = sign(&k, &d, &m);
    assert_eq!(verify_signature(&pubkey, &d, &m, &sig), Ok(()));
}

#[test]
fn tampered_digest_manifest_or_key_fails() {
    let k = key(1);
    let pubkey = k.verifying_key();
    let (d, m) = (Digest::of(b"a"), manifest("0.1.0"));
    let sig = sign(&k, &d, &m);
    assert_eq!(
        verify_signature(&pubkey, &Digest::of(b"b"), &m, &sig),
        Err(SignError::Invalid)
    );
    assert_eq!(
        verify_signature(&pubkey, &d, &manifest("0.1.1"), &sig),
        Err(SignError::Invalid)
    );
    assert_eq!(
        verify_signature(&key(2).verifying_key(), &d, &m, &sig),
        Err(SignError::Invalid)
    );
}

#[test]
fn bad_key_hex_rejected() {
    assert!(matches!(
        signing_key_from_hex("zz"),
        Err(SignError::BadHex(_))
    ));
    assert!(matches!(
        signing_key_from_hex("00ff"),
        Err(SignError::BadLength { .. })
    ));
}

#[test]
fn registry_publish_current_list_load() {
    let tmp = std::env::temp_dir().join(format!("reg-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&tmp);
    let reg = DirRegistry::new(&tmp);
    let k = key(3);
    assert_eq!(reg.current("w").unwrap(), None);
    assert!(reg.list("w").unwrap().is_empty());

    let e1 = entry(b"one", "0.1.0", &k);
    let d1 = reg.publish(&e1).unwrap();
    assert_eq!(reg.current("w").unwrap(), Some(d1.clone()));
    let e2 = entry(b"two", "0.2.0", &k);
    let d2 = reg.publish(&e2).unwrap();
    assert_eq!(reg.current("w").unwrap(), Some(d2.clone()));

    let mut want = vec![d1.clone(), d2];
    want.sort();
    assert_eq!(reg.list("w").unwrap(), want);
    assert_eq!(reg.load("w", &d1).unwrap(), e1);
    assert!(tmp.join("w").join(d1.as_hex()).join("worker.sig").exists());
    std::fs::remove_dir_all(&tmp).unwrap();
}

#[test]
fn registry_rejects_unsafe_name_and_digest_mismatch() {
    let tmp = std::env::temp_dir().join(format!("reg-bad-{}", std::process::id()));
    let reg = DirRegistry::new(&tmp);
    assert!(matches!(
        reg.current("../x"),
        Err(RegistryError::BadName(_))
    ));
    let mut e = entry(b"one", "0.1.0", &key(3));
    e.wasm = b"changed".to_vec();
    assert!(matches!(reg.publish(&e), Err(RegistryError::Corrupt(_))));
    let _ = std::fs::remove_dir_all(&tmp);
}
