use bpmnkit_wasm_contract::*;

const OK: &str = r#"
[worker]
name = "charge-card"
version = "0.1.0"
job_types = ["charge-card"]

[limits]
memory_mb = 64
timeout_ms = 10_000
max_concurrent = 8

[network]
allow = ["api.stripe.com:443"]

[secrets]
names = ["STRIPE_KEY"]
"#;

fn base() -> Manifest {
    toml::from_str(OK).unwrap()
}

#[test]
fn valid_and_roundtrip() {
    let v = ValidManifest::from_toml(OK).unwrap();
    assert_eq!(world_for(&v), World::WorkerHttp);
    let again = ValidManifest::from_toml(&v.to_toml()).unwrap();
    assert_eq!(v, again);
    let json = serde_json::to_string(&v).unwrap();
    assert_eq!(serde_json::from_str::<ValidManifest>(&json).unwrap(), v);
}

#[test]
fn defaults_and_no_network_is_plain_world() {
    let v = ValidManifest::from_toml("[worker]\nname=\"a\"\nversion=\"1.0.0\"\njob_types=[\"a\"]")
        .unwrap();
    assert_eq!(v.limits, Limits::default());
    assert_eq!(world_for(&v), World::Worker);
}

#[test]
fn deserialising_an_invalid_manifest_fails() {
    let mut m = base();
    m.worker.name = "Bad".into();
    let json = serde_json::to_string(&m).unwrap();
    assert!(serde_json::from_str::<ValidManifest>(&json).is_err());
}

fn errs(f: impl FnOnce(&mut Manifest)) -> Vec<ManifestError> {
    let mut m = base();
    f(&mut m);
    validate(m).unwrap_err()
}

#[test]
fn rules_table() {
    use ManifestError as E;
    let cases: Vec<(&str, Vec<E>)> = vec![
        ("upper-case name", errs(|m| m.worker.name = "Charge".into())),
        ("empty name", errs(|m| m.worker.name = String::new())),
        ("leading dash name", errs(|m| m.worker.name = "-a".into())),
        ("64-char name", errs(|m| m.worker.name = "a".repeat(64))),
        ("no job types", errs(|m| m.worker.job_types.clear())),
        (
            "wildcard job type",
            errs(|m| m.worker.job_types = vec!["pay-*".into()]),
        ),
        (
            "dup job type",
            errs(|m| m.worker.job_types = vec!["a".into(), "a".into()]),
        ),
        ("bad version", errs(|m| m.worker.version = "one".into())),
        ("zero memory", errs(|m| m.limits.memory_mb = 0)),
        ("memory ceiling", errs(|m| m.limits.memory_mb = 257)),
        ("timeout ceiling", errs(|m| m.limits.timeout_ms = 60_001)),
        (
            "concurrency ceiling",
            errs(|m| m.limits.max_concurrent = 65),
        ),
        (
            "no port",
            errs(|m| m.network.allow = vec!["api.stripe.com".into()]),
        ),
        (
            "port 80",
            errs(|m| m.network.allow = vec!["api.stripe.com:80".into()]),
        ),
        (
            "port nan",
            errs(|m| m.network.allow = vec!["api.stripe.com:https".into()]),
        ),
        (
            "wildcard host",
            errs(|m| m.network.allow = vec!["*.stripe.com:443".into()]),
        ),
        (
            "ipv4",
            errs(|m| m.network.allow = vec!["10.0.0.1:443".into()]),
        ),
        (
            "ipv4 public",
            errs(|m| m.network.allow = vec!["8.8.8.8:443".into()]),
        ),
        ("ipv6", errs(|m| m.network.allow = vec!["[::1]:443".into()])),
        (
            "localhost",
            errs(|m| m.network.allow = vec!["localhost:443".into()]),
        ),
        (
            "internal suffix",
            errs(|m| m.network.allow = vec!["db.internal:443".into()]),
        ),
        (
            "upper host",
            errs(|m| m.network.allow = vec!["API.stripe.com:443".into()]),
        ),
        (
            "path in host",
            errs(|m| m.network.allow = vec!["a.com/x:443".into()]),
        ),
        (
            "dup network",
            errs(|m| m.network.allow = vec!["a.com:443".into(), "a.com:443".into()]),
        ),
        (
            "lower secret",
            errs(|m| m.secrets.names = vec!["stripe_key".into()]),
        ),
        (
            "dup secret",
            errs(|m| m.secrets.names = vec!["A".into(), "A".into()]),
        ),
    ];
    for (name, e) in &cases {
        assert_eq!(e.len(), 1, "{name}: {e:?}");
    }
    assert!(matches!(cases[0].1[0], E::BadName(_)));
    assert!(matches!(cases[4].1[0], E::NoJobTypes));
    assert!(matches!(
        cases[9].1[0],
        E::LimitAboveCeiling {
            field: "memory_mb",
            ..
        }
    ));
}

#[test]
fn custom_ceilings() {
    let c = PlatformCeilings {
        ports: vec![443, 8443],
        ..PlatformCeilings::default()
    };
    let mut m = base();
    m.network.allow = vec!["a.example.com:8443".into()];
    assert!(validate_with(m.clone(), &c).is_ok());
    assert!(validate(m).is_err());
}

#[test]
fn unknown_toml_field_rejected() {
    assert!(toml::from_str::<Manifest>(
        "[worker]\nname=\"a\"\nversion=\"1.0.0\"\njob_types=[\"a\"]\n[x]\n"
    )
    .is_err());
}

#[test]
fn digest() {
    let d = Digest::of(b"abc");
    assert_eq!(
        d.as_hex(),
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    assert!(Digest::try_from("zz".to_owned()).is_err());
    let m = ValidManifest::from_toml(OK).unwrap();
    let a = ArtifactMetadata {
        component_digest: d.clone(),
        source_digest: d.clone(),
        manifest: m,
        contract_version: CONTRACT_VERSION.parse().unwrap(),
        sdk_version: "0.1.0".parse().unwrap(),
        toolchain: "rustc 1.97.0".into(),
        lock_digest: d,
    };
    let back: ArtifactMetadata = serde_json::from_str(&serde_json::to_string(&a).unwrap()).unwrap();
    assert_eq!(a, back);
}

#[test]
fn wit_exposed() {
    assert!(WIT.contains("package bpmnkit:worker@0.1.0;"));
    assert!(WIT.contains("world worker-http"));
}

#[test]
fn sample_job_http_defaults_empty_and_round_trips() {
    let s: SampleJob = serde_json::from_str(r#"{"name":"n","job_type":"t"}"#).unwrap();
    assert!(s.http.is_empty());
    assert!(!serde_json::to_string(&s).unwrap().contains("http"));
    let s: SampleJob = serde_json::from_str(
        r#"{"name":"n","job_type":"t","http":[{"method":"POST","url":"https://a.example/x","status":402}]}"#,
    )
    .unwrap();
    assert_eq!(s.http[0].status, 402);
    assert_eq!(s.http[0].body, "");
    let back: SampleJob = serde_json::from_str(&serde_json::to_string(&s).unwrap()).unwrap();
    assert_eq!(back, s);
}
