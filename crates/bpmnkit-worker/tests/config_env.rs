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
