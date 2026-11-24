//! Cluster settings: `CAMUNDA_*` variables, else the active CLI profile (`BPMNKIT_PROFILE_JSON`,
//! set when the host runs as a `bpmnkit` plugin).

use bpmnkit_worker::{ClientConfig, Error};
use serde_json::Value;

/// `CAMUNDA_*` from `get`; when `CAMUNDA_REST_ADDRESS` is unset, the profile fills the gaps.
pub fn client_config(get: impl Fn(&str) -> Option<String>) -> Result<ClientConfig, Error> {
    let profile = get("BPMNKIT_PROFILE_JSON")
        .filter(|_| get("CAMUNDA_REST_ADDRESS").is_none())
        .and_then(|s| serde_json::from_str::<Value>(&s).ok());
    ClientConfig::from_lookup(|k| {
        get(k).or_else(|| profile.as_ref().and_then(|p| from_profile(&p["config"], k)))
    })
}

fn from_profile(c: &Value, key: &str) -> Option<String> {
    let s = |v: &Value| v.as_str().filter(|s| !s.is_empty()).map(str::to_owned);
    let auth = &c["auth"];
    let kind = auth["type"].as_str().unwrap_or("none");
    match key {
        "CAMUNDA_REST_ADDRESS" => s(&c["baseUrl"]),
        "CAMUNDA_AUTH_STRATEGY" => Some(
            match kind {
                "oauth2" => "OAUTH",
                "bearer" => "BEARER",
                "basic" => "BASIC",
                _ => "NONE",
            }
            .into(),
        ),
        "CAMUNDA_CLIENT_ID" => s(&auth["clientId"]),
        "CAMUNDA_CLIENT_SECRET" => s(&auth["clientSecret"]),
        "CAMUNDA_OAUTH_URL" => s(&auth["oauthUrl"]).or_else(|| s(&auth["tokenUrl"])),
        "CAMUNDA_TOKEN_AUDIENCE" => s(&auth["audience"]),
        "CAMUNDA_TOKEN_SCOPE" => s(&auth["scope"]),
        "CAMUNDA_TOKEN" => s(&auth["token"]),
        "CAMUNDA_BASIC_AUTH_USERNAME" => s(&auth["username"]),
        "CAMUNDA_BASIC_AUTH_PASSWORD" => s(&auth["password"]),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bpmnkit_worker::Credentials;
    use std::collections::HashMap;

    fn cfg(vars: &[(&str, &str)]) -> ClientConfig {
        let m: HashMap<_, _> = vars.iter().map(|(k, v)| (*k, v.to_string())).collect();
        client_config(|k| m.get(k).cloned()).unwrap()
    }

    #[test]
    fn env_wins_over_profile() {
        let p = r#"{"name":"p","config":{"baseUrl":"http://profile:8080"}}"#;
        assert_eq!(
            cfg(&[
                ("CAMUNDA_REST_ADDRESS", "http://env:8080"),
                ("BPMNKIT_PROFILE_JSON", p)
            ])
            .rest_address,
            "http://env:8080"
        );
    }

    #[test]
    fn profile_supplies_address_and_oauth() {
        let p = r#"{"name":"p","config":{"baseUrl":"https://c8/v2","auth":{"type":"oauth2",
            "clientId":"id","clientSecret":"s","oauthUrl":"https://login/token"}}}"#;
        let c = cfg(&[("BPMNKIT_PROFILE_JSON", p)]);
        assert_eq!(c.rest_address, "https://c8/v2");
        match c.credentials {
            Credentials::OAuth(o) => {
                assert_eq!(
                    (o.client_id.as_str(), o.token_url.as_str()),
                    ("id", "https://login/token")
                )
            }
            _ => panic!("expected OAuth credentials"),
        }
    }
}
