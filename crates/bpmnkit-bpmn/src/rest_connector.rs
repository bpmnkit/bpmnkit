//! Port of `bpmn/rest-connector.ts`: the Camunda REST (HTTP JSON) connector as Zeebe
//! input mappings and task headers.

use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

use crate::js::{js_number_to_string, object_entries};
use crate::zeebe::{ZeebeIoMappingEntry, ZeebeTaskHeaderEntry};

/// TS's `HttpMethod`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HttpMethod {
    #[serde(rename = "GET")]
    Get,
    #[serde(rename = "POST")]
    Post,
    #[serde(rename = "PUT")]
    Put,
    #[serde(rename = "PATCH")]
    Patch,
    #[serde(rename = "DELETE")]
    Delete,
}

impl HttpMethod {
    pub fn as_str(self) -> &'static str {
        match self {
            HttpMethod::Get => "GET",
            HttpMethod::Post => "POST",
            HttpMethod::Put => "PUT",
            HttpMethod::Patch => "PATCH",
            HttpMethod::Delete => "DELETE",
        }
    }
}

/// TS's `RestAuthentication`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum RestAuthentication {
    #[serde(rename = "noAuth")]
    NoAuth,
    #[serde(rename = "bearer")]
    Bearer { token: String },
}

/// `Record<string, string> | string`: key-value pairs, or a FEEL expression as written.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum StringOrPairs {
    Text(String),
    /// Written in `Object.entries` order (integer-like keys first), see [`object_entries`].
    Pairs(IndexMap<String, String>),
}

/// TS's `RestConnectorConfig`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestConnectorConfig {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub method: HttpMethod,
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub authentication: Option<RestAuthentication>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<StringOrPairs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub query_parameters: Option<StringOrPairs>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub connection_timeout_in_seconds: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub read_timeout_in_seconds: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub retries: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub result_variable: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub result_expression: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub retry_backoff: Option<String>,
}

const REST_CONNECTOR_TYPE: &str = "io.camunda:http-json:1";

/// Version of the bundled `io.camunda.connectors.HttpJson.v2` template; follows TS's.
pub const REST_CONNECTOR_TEMPLATE_VERSION: &str = "18";
const DEFAULT_TIMEOUT: f64 = 20.0;
const DEFAULT_RETRIES: &str = "3";

fn entry(source: impl Into<String>, target: &str) -> ZeebeIoMappingEntry {
    ZeebeIoMappingEntry {
        source: source.into(),
        target: target.to_owned(),
    }
}

/// TS's `restConnectorToIoMappingInputs`.
pub fn rest_connector_to_io_mapping_inputs(
    config: &RestConnectorConfig,
) -> Vec<ZeebeIoMappingEntry> {
    let mut inputs = vec![];
    match &config.authentication {
        None | Some(RestAuthentication::NoAuth) => {
            inputs.push(entry("noAuth", "authentication.type"));
        }
        Some(RestAuthentication::Bearer { token }) => {
            inputs.push(entry("bearer", "authentication.type"));
            inputs.push(entry(token.clone(), "authentication.token"));
        }
    }
    inputs.push(entry(config.method.as_str(), "method"));
    inputs.push(entry(config.url.clone(), "url"));
    if let Some(headers) = &config.headers {
        inputs.push(entry(feel_value(headers), "headers"));
    }
    if let Some(query) = &config.query_parameters {
        inputs.push(entry(feel_value(query), "queryParameters"));
    }
    if let Some(body) = &config.body {
        inputs.push(entry(body.clone(), "body"));
    }
    inputs.push(entry(
        js_number_to_string(
            config
                .connection_timeout_in_seconds
                .unwrap_or(DEFAULT_TIMEOUT),
        ),
        "connectionTimeoutInSeconds",
    ));
    inputs.push(entry(
        js_number_to_string(config.read_timeout_in_seconds.unwrap_or(DEFAULT_TIMEOUT)),
        "readTimeoutInSeconds",
    ));
    inputs
}

/// TS's `restConnectorTaskType`.
pub fn rest_connector_task_type() -> &'static str {
    REST_CONNECTOR_TYPE
}

/// TS's `restConnectorRetries`.
pub fn rest_connector_retries(config: &RestConnectorConfig) -> String {
    config
        .retries
        .clone()
        .unwrap_or_else(|| DEFAULT_RETRIES.to_owned())
}

/// TS's `restConnectorToTaskHeaders`.
pub fn rest_connector_to_task_headers(config: &RestConnectorConfig) -> Vec<ZeebeTaskHeaderEntry> {
    let mut headers = vec![];
    let mut push = |key: &str, value: &Option<String>| {
        if let Some(value) = value {
            headers.push(ZeebeTaskHeaderEntry {
                key: key.to_owned(),
                value: value.clone(),
            });
        }
    };
    push("resultVariable", &config.result_variable);
    push("resultExpression", &config.result_expression);
    push("retryBackoff", &config.retry_backoff);
    headers
}

fn feel_value(value: &StringOrPairs) -> String {
    match value {
        StringOrPairs::Text(text) => text.clone(),
        StringOrPairs::Pairs(pairs) => serialize_feel_object(pairs),
    }
}

/// `{"k":"v", …}` as a FEEL context; values are not escaped, as in TS.
fn serialize_feel_object(obj: &IndexMap<String, String>) -> String {
    let entries: Vec<String> = object_entries(obj)
        .into_iter()
        .map(|(key, value)| format!("\"{key}\":\"{value}\""))
        .collect();
    format!("={{{}}}", entries.join(", "))
}
