//! Environment → ClientConfig.

use std::collections::BTreeMap;

use bpmnkit_worker::{ClientConfig, Credentials, Error};

fn from(pairs: &[(&str, &str)]) -> Result<ClientConfig, Error> {
    let env: BTreeMap<String, String> = pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect();
    ClientConfig::from_lookup(|k| env.get(k).cloned())
}

#[test]
fn defaults_without_env() {
    let c = from(&[]).unwrap();
    assert_eq!(c.rest_address, "http://0.0.0.0:8080");
    assert!(matches!(c.credentials, Credentials::None));
    assert_eq!(c.tenant_ids, vec!["<default>"]);
}

#[test]
fn address_tenant_basic_bearer() {
    let c = from(&[
        ("CAMUNDA_REST_ADDRESS", "https://c8.example/v2"),
        ("CAMUNDA_TENANT_ID", "acme"),
        ("CAMUNDA_BASIC_AUTH_USERNAME", "u"),
        ("CAMUNDA_BASIC_AUTH_PASSWORD", "p"),
    ])
    .unwrap();
    assert_eq!(c.rest_address, "https://c8.example/v2");
    assert_eq!(c.tenant_ids, vec!["acme"]);
    assert!(matches!(c.credentials, Credentials::Basic { ref username, .. } if username == "u"));
    assert!(matches!(
        from(&[("CAMUNDA_TOKEN", "t")]).unwrap().credentials,
        Credentials::Bearer(_)
    ));
    assert!(
        from(&[("CAMUNDA_BASIC_AUTH_USERNAME", "u")]).is_err(),
        "password missing"
    );
}

#[test]
fn strategy_is_checked() {
    assert!(from(&[("CAMUNDA_AUTH_STRATEGY", "kerberos")]).is_err());
    assert!(matches!(
        from(&[("CAMUNDA_AUTH_STRATEGY", "none"), ("CAMUNDA_TOKEN", "t")])
            .unwrap()
            .credentials,
        Credentials::None
    ));
}

#[cfg(feature = "oauth")]
#[test]
fn oauth_from_client_id_and_secret() {
    let c = from(&[
        ("CAMUNDA_CLIENT_ID", "id"),
        ("CAMUNDA_CLIENT_SECRET", "s"),
        ("CAMUNDA_OAUTH_URL", "https://login/oauth/token"),
        ("CAMUNDA_TOKEN_AUDIENCE", "zeebe-api"),
    ])
    .unwrap();
    match c.credentials {
        Credentials::OAuth(o) => {
            assert_eq!(o.token_url, "https://login/oauth/token");
            assert_eq!(o.audience.as_deref(), Some("zeebe-api"));
            assert_eq!(o.scope, None);
        }
        other => panic!("{other:?}"),
    }
    assert!(
        from(&[("CAMUNDA_CLIENT_ID", "id"), ("CAMUNDA_CLIENT_SECRET", "s")]).is_err(),
        "no OAuth URL"
    );
}

#[test]
fn grpc_address_and_tls_files() {
    assert_eq!(from(&[]).unwrap().grpc_address, "http://0.0.0.0:26500");
    assert!(from(&[]).unwrap().tls.is_none());
    let dir = std::env::temp_dir().join(format!("bpmnkit-worker-tls-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let write = |n: &str, c: &str| {
        let p = dir.join(n);
        std::fs::write(&p, c).unwrap();
        p.to_string_lossy().into_owned()
    };
    let (ca, cert, key) = (
        write("ca.pem", "-----BEGIN CERTIFICATE-----CA"),
        write("c.pem", "-----BEGIN CERTIFICATE-----CERT"),
        write("k.pem", "KEY"),
    );
    let c = from(&[
        ("CAMUNDA_GRPC_ADDRESS", "https://g:443"),
        ("CAMUNDA_CA_CERT_PATH", &ca),
        ("CAMUNDA_CLIENT_CERT_PATH", &cert),
        ("CAMUNDA_CLIENT_KEY_PATH", &key),
    ])
    .unwrap();
    assert_eq!(c.grpc_address, "https://g:443");
    let t = c.tls.unwrap();
    assert_eq!(
        t.ca_cert_pem.as_deref(),
        Some(&b"-----BEGIN CERTIFICATE-----CA"[..])
    );
    assert_eq!(
        t.client_cert_pem.as_deref(),
        Some(&b"-----BEGIN CERTIFICATE-----CERT"[..])
    );
    assert_eq!(t.client_key_pem.as_deref(), Some(&b"KEY"[..]));
    // The private key is not printable.
    assert!(!format!("{t:?}").contains("KEY"));
    // A client certificate without its key, and an unreadable file, are config errors.
    assert!(matches!(
        from(&[("CAMUNDA_CLIENT_CERT_PATH", &cert)]),
        Err(Error::Config(_))
    ));
    assert!(matches!(
        from(&[("CAMUNDA_CA_CERT_PATH", "/no/such/file.pem")]),
        Err(Error::Config(_))
    ));
    std::fs::remove_dir_all(dir).unwrap();
}

#[test]
fn rest_client_rejects_bad_tls_material() {
    use bpmnkit_worker::{RestClient, TlsConfig};
    let with = |t: TlsConfig| {
        RestClient::new(ClientConfig {
            tls: Some(t),
            ..ClientConfig::default()
        })
        .err()
    };
    assert!(matches!(
        with(TlsConfig {
            ca_cert_pem: Some(b"not a pem".to_vec()),
            ..Default::default()
        }),
        Some(Error::Config(_))
    ));
    assert!(matches!(
        with(TlsConfig {
            client_cert_pem: Some(b"-----BEGIN CERTIFICATE-----x".to_vec()),
            client_key_pem: Some(b"not a pem".to_vec()),
            ..Default::default()
        }),
        Some(Error::Config(_))
    ));
}
