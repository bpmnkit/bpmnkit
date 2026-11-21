//! Turning operations into element templates: port of `build-template.ts`. Templates are
//! `serde_json::Value`s built in the TS object-literal key order (the crate enables
//! `preserve_order`), so `serde_json::to_string_pretty` equals `JSON.stringify(x, null, 2)`.

use crate::jsval::{get, get_opt, js_string, nullish, truthy, truthy_opt};
use crate::openapi::OperationWithMeta;
use crate::{AuthHint, GeneratorOptions};
use bpmnkit_bpmn::js::js_trim;
use serde_json::{json, Map, Value};

/// `CONNECTOR_SCHEMA`.
pub const CONNECTOR_SCHEMA: &str =
    "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json";

type Prop = Vec<(&'static str, Option<Value>)>;

/// An object literal where `None` is a JS `undefined` (key omitted).
fn obj(fields: Prop) -> Value {
    Value::Object(
        fields
            .into_iter()
            .filter_map(|(k, v)| v.map(|v| (k.to_owned(), v)))
            .collect::<Map<_, _>>(),
    )
}

fn s(v: &str) -> Option<Value> {
    Some(Value::String(v.to_owned()))
}

fn v(x: Value) -> Option<Value> {
    Some(x)
}

fn input(name: &str) -> Option<Value> {
    Some(json!({ "type": "zeebe:input", "name": name }))
}

fn header(key: &str) -> Option<Value> {
    Some(json!({ "type": "zeebe:taskHeader", "key": key }))
}

// ─── Slugify / ID helpers ───────────────────────────────────────────────────────

fn slugify(text: &str) -> String {
    let mut out = String::new();
    let mut in_run = false;
    for c in text.chars() {
        if c.is_ascii_alphanumeric() {
            out.push(c);
            in_run = false;
        } else if !in_run {
            out.push('-');
            in_run = true;
        }
    }
    out.trim_matches('-').to_lowercase()
}

fn operation_name(op: &OperationWithMeta) -> String {
    if let Some(id) = get(&op.operation, "operationId").filter(|v| truthy(v)) {
        return js_string(Some(id));
    }
    let segs: Vec<String> = op
        .path
        .split('/')
        .filter(|p| !p.is_empty())
        .map(|p| p.replace(['{', '}'], ""))
        .collect();
    format!("{}_{}", op.method, segs.join("_"))
}

fn to_display_name(id: &str) -> String {
    let chars: Vec<char> = id.chars().collect();
    // /([a-z])([A-Z])/g, "$1 $2": matches do not overlap.
    let mut spaced = String::new();
    let mut i = 0;
    while i < chars.len() {
        if i + 1 < chars.len() && chars[i].is_ascii_lowercase() && chars[i + 1].is_ascii_uppercase()
        {
            spaced.push(chars[i]);
            spaced.push(' ');
            spaced.push(chars[i + 1]);
            i += 2;
        } else {
            spaced.push(chars[i]);
            i += 1;
        }
    }
    // /[-_]+/g, " "
    let mut seps = String::new();
    let mut in_run = false;
    for c in spaced.chars() {
        if c == '-' || c == '_' {
            if !in_run {
                seps.push(' ');
            }
            in_run = true;
        } else {
            seps.push(c);
            in_run = false;
        }
    }
    // /\b\w/g: a word character (ASCII, as in JS) after a non-word one or at the start.
    let word = |c: char| c.is_ascii_alphanumeric() || c == '_';
    let mut out = String::new();
    let mut prev_word = false;
    for c in seps.chars() {
        let w = word(c);
        if w && !prev_word {
            out.extend(c.to_uppercase());
        } else {
            out.push(c);
        }
        prev_word = w;
    }
    js_trim(&out).to_owned()
}

// ─── URL / parameters ───────────────────────────────────────────────────────────

/// `path.split(/(\{[^}]+\})/)`: text and `{name}` pieces alternating, text first.
fn split_path(path: &str) -> Vec<String> {
    let mut pieces = vec![];
    let mut text_start = 0;
    let mut i = 0;
    while i < path.len() {
        if path.as_bytes()[i] == b'{' {
            if let Some(rel) = path[i + 1..].find('}') {
                if rel > 0 {
                    let end = i + 1 + rel + 1;
                    pieces.push(path[text_start..i].to_owned());
                    pieces.push(path[i..end].to_owned());
                    text_start = end;
                    i = end;
                    continue;
                }
            } else {
                break;
            }
        }
        i += 1;
    }
    pieces.push(path[text_start..].to_owned());
    pieces
}

fn build_url_field(op: &OperationWithMeta, base_override: Option<&str>) -> Value {
    let base = match base_override.filter(|b| !b.is_empty()) {
        Some(b) => b.strip_suffix('/').unwrap_or(b).to_owned(),
        None => op.base_url.clone(),
    };
    if op.path_params.is_empty() {
        return obj(vec![
            ("type", s("Hidden")),
            ("value", s(&format!("{base}{}", op.path))),
            ("binding", input("url")),
        ]);
    }
    // Every non-parameter piece, empty ones included, carries the base URL: as in TS.
    let parts: Vec<String> = split_path(&op.path)
        .into_iter()
        .enumerate()
        .map(|(n, part)| {
            if n % 2 == 1 {
                part[1..part.len() - 1].to_owned()
            } else {
                serde_json::to_string(&format!("{base}{part}")).unwrap_or_default()
            }
        })
        .filter(|p| p != "\"\"")
        .collect();
    obj(vec![
        ("label", s("URL")),
        ("type", s("String")),
        ("value", s(&format!("={}", parts.join(" + ")))),
        ("group", s("endpoint")),
        ("feel", s("optional")),
        ("binding", input("url")),
        ("constraints", v(json!({ "notEmpty": true }))),
    ])
}

fn name_of(p: &Value) -> String {
    js_string(get(p, "name"))
}

fn build_path_param_field(param: &Value) -> Value {
    let name = name_of(param);
    obj(vec![
        ("id", s(&name)),
        ("label", s(&to_display_name(&name))),
        ("description", get(param, "description").cloned()),
        ("type", s("String")),
        ("group", s("endpoint")),
        ("feel", s("optional")),
        ("binding", input(&name)),
        (
            "constraints",
            (get(param, "required") != Some(&Value::Bool(false)))
                .then(|| json!({ "notEmpty": true })),
        ),
    ])
}

fn required(p: &Value) -> bool {
    truthy_opt(get(p, "required"))
}

fn build_query_params_field(query: &[Value]) -> Value {
    if query.is_empty() {
        return obj(vec![
            ("label", s("Query parameters")),
            ("type", s("Text")),
            ("group", s("endpoint")),
            ("feel", s("required")),
            ("optional", v(json!(true))),
            ("binding", input("queryParameters")),
            ("value", s("={}")),
        ]);
    }
    let entries: Vec<String> = query
        .iter()
        .map(|p| format!("\"{0}\": {0}Value", name_of(p)))
        .collect();
    let names: Vec<String> = query.iter().map(|p| format!("`{}`", name_of(p))).collect();
    let req_names: Vec<String> = query
        .iter()
        .filter(|p| required(p))
        .map(|p| format!("`{}`", name_of(p)))
        .collect();
    let req = if req_names.is_empty() {
        String::new()
    } else {
        format!(". Required: {}.", req_names.join(", "))
    };
    obj(vec![
        ("label", s("Query parameters")),
        (
            "description",
            s(&format!(
                "Available: {}{req} Remove unused keys from the FEEL context.",
                names.join(", ")
            )),
        ),
        ("type", s("Text")),
        ("group", s("endpoint")),
        ("feel", s("required")),
        ("optional", v(json!(query.iter().all(|p| !required(p))))),
        ("binding", input("queryParameters")),
        ("value", s(&format!("={{{}}}", entries.join(", ")))),
    ])
}

fn build_headers_field(headers: &[Value]) -> Value {
    if headers.is_empty() {
        return obj(vec![
            ("label", s("Headers")),
            ("type", s("Text")),
            ("group", s("endpoint")),
            ("feel", s("required")),
            ("optional", v(json!(true))),
            ("binding", input("headers")),
            ("value", s("={}")),
        ]);
    }
    let entries: Vec<String> = headers
        .iter()
        .map(|p| format!("\"{}\": {}Value", name_of(p), slugify(&name_of(p))))
        .collect();
    obj(vec![
        ("label", s("Headers")),
        ("type", s("Text")),
        ("group", s("endpoint")),
        ("feel", s("required")),
        ("optional", v(json!(headers.iter().all(|p| !required(p))))),
        ("binding", input("headers")),
        ("value", s(&format!("={{{}}}", entries.join(", ")))),
    ])
}

// ─── Body ───────────────────────────────────────────────────────────────────────

fn build_body_fields(op: &OperationWithMeta, expand_body: bool) -> Vec<Value> {
    if !matches!(op.method, "post" | "put" | "patch") {
        return vec![];
    }
    let condition =
        || json!({ "property": "method", "oneOf": ["POST", "PUT", "PATCH"], "type": "simple" });
    let schema = op.request_body_schema.as_ref();
    let properties = get_opt(schema, "properties").filter(|p| truthy(p));
    let (true, Some(schema), Some(properties)) = (expand_body, schema, properties) else {
        return vec![obj(vec![
            ("label", s("Request body")),
            ("description", get_opt(schema, "description").cloned()),
            ("type", s("Text")),
            ("group", s("payload")),
            ("feel", s("required")),
            ("optional", v(json!(true))),
            ("binding", input("body")),
            ("value", s("={}")),
            ("condition", v(condition())),
        ])];
    };
    let required: Vec<&str> = get(schema, "required")
        .and_then(Value::as_array)
        .map(|a| a.iter().filter_map(Value::as_str).collect())
        .unwrap_or_default();
    let Some(props) = properties.as_object() else {
        return vec![];
    };
    props
        .iter()
        .map(|(name, prop)| {
            let ty = match get(prop, "type").and_then(Value::as_str) {
                Some("boolean") => "Boolean",
                Some("number" | "integer") => "Number",
                _ => "String",
            };
            let req = required.contains(&name.as_str());
            obj(vec![
                ("id", s(&format!("body.{name}"))),
                ("label", s(&to_display_name(name))),
                ("description", get(prop, "description").cloned()),
                ("type", s(ty)),
                ("group", s("payload")),
                ("feel", s("optional")),
                ("optional", v(json!(!req))),
                ("binding", input(&format!("body.{name}"))),
                ("constraints", req.then(|| json!({ "notEmpty": true }))),
                ("condition", v(condition())),
            ])
        })
        .collect()
}

// ─── Authentication ─────────────────────────────────────────────────────────────

fn auth_cond(equals: &str) -> Option<Value> {
    Some(json!({ "property": "authentication.type", "equals": equals, "type": "simple" }))
}

fn auth_string(id: &str, label: &str, cond: &str, optional: bool) -> Value {
    obj(vec![
        ("id", s(id)),
        ("label", s(label)),
        ("type", s("String")),
        ("group", s("authentication")),
        ("feel", s("optional")),
        ("optional", optional.then(|| json!(true))),
        ("binding", input(id)),
        ("condition", auth_cond(cond)),
        (
            "constraints",
            (!optional).then(|| json!({ "notEmpty": true })),
        ),
    ])
}

fn build_auth_block(default_auth: AuthHint) -> Vec<Value> {
    const OAUTH: &str = "oauth-client-credentials-flow";
    let dropdown = |id: &str, label: &str, value: &str, cond: Option<Value>, choices: Value| {
        obj(vec![
            ("id", s(id)),
            ("label", s(label)),
            ("type", s("Dropdown")),
            ("group", s("authentication")),
            ("value", s(value)),
            ("binding", input(id)),
            ("condition", cond),
            ("choices", Some(choices)),
        ])
    };
    vec![
        dropdown(
            "authentication.type",
            "Type",
            default_auth.as_str(),
            None,
            json!([
                { "name": "No auth", "value": "noAuth" },
                { "name": "API key", "value": "apiKey" },
                { "name": "Basic auth", "value": "basic" },
                { "name": "Bearer token", "value": "bearer" },
                { "name": "OAuth 2.0 (Client Credentials)", "value": "oauth-client-credentials-flow" },
            ]),
        ),
        dropdown(
            "authentication.apiKeyLocation",
            "API key location",
            "headers",
            auth_cond("apiKey"),
            json!([{ "name": "Header", "value": "headers" }, { "name": "Query parameter", "value": "query" }]),
        ),
        auth_string("authentication.apiKeyName", "API key name", "apiKey", false),
        auth_string(
            "authentication.apiKeyValue",
            "API key value",
            "apiKey",
            false,
        ),
        auth_string("authentication.username", "Username", "basic", false),
        auth_string("authentication.password", "Password", "basic", false),
        auth_string("authentication.token", "Bearer token", "bearer", false),
        auth_string(
            "authentication.oauthTokenEndpoint",
            "OAuth token endpoint",
            OAUTH,
            false,
        ),
        auth_string("authentication.clientId", "Client ID", OAUTH, false),
        auth_string("authentication.clientSecret", "Client secret", OAUTH, false),
        dropdown(
            "authentication.clientAuthentication",
            "Client authentication",
            "basicAuthHeader",
            auth_cond(OAUTH),
            json!([
                { "name": "Send as Basic Auth header", "value": "basicAuthHeader" },
                { "name": "Send client credentials in body", "value": "requestBody" },
            ]),
        ),
        auth_string("authentication.scopes", "Scopes", OAUTH, true),
        auth_string("authentication.audience", "Audience", OAUTH, true),
    ]
}

// ─── Timeout / output / error / retry ───────────────────────────────────────────

fn build_timeout_block() -> Vec<Value> {
    let one = |label: &str, name: &str| {
        obj(vec![
            ("label", s(label)),
            ("type", s("Number")),
            ("group", s("timeout")),
            ("value", v(json!(20))),
            ("feel", s("optional")),
            ("optional", v(json!(true))),
            ("binding", input(name)),
        ])
    };
    vec![
        one("Connection timeout (seconds)", "connectionTimeoutInSeconds"),
        one("Read timeout (seconds)", "readTimeoutInSeconds"),
    ]
}

fn build_output_block(response_schema: Option<&Value>) -> Vec<Value> {
    let mut hint = String::new();
    if let Some(Value::Object(props)) = get_opt(response_schema, "properties") {
        let keys: Vec<&String> = props.keys().take(3).collect();
        if !keys.is_empty() {
            let pairs: Vec<String> = keys
                .iter()
                .map(|k| format!("{k}: response.body.{k}"))
                .collect();
            hint = format!("={{{}}}", pairs.join(", "));
        }
    }
    vec![
        obj(vec![
            ("label", s("Result variable")),
            ("type", s("String")),
            ("group", s("output")),
            ("feel", s("static")),
            ("optional", v(json!(true))),
            ("binding", header("resultVariable")),
        ]),
        obj(vec![
            ("label", s("Result expression")),
            (
                "description",
                s(&if hint.is_empty() {
                    "FEEL expression to extract values from the response".to_owned()
                } else {
                    format!("Example: `{hint}`")
                }),
            ),
            ("type", s("Text")),
            ("group", s("output")),
            ("feel", s("required")),
            ("optional", v(json!(true))),
            ("binding", header("resultExpression")),
        ]),
    ]
}

fn build_error_block() -> Vec<Value> {
    vec![obj(vec![
        ("label", s("Error expression")),
        (
            "description",
            s("Example: `=if error.code = 404 then bpmnError(\"NOT_FOUND\", error.message) else null`"),
        ),
        ("type", s("Text")),
        ("group", s("errors")),
        ("feel", s("required")),
        ("optional", v(json!(true))),
        ("binding", header("errorExpression")),
    ])]
}

fn build_retry_block() -> Vec<Value> {
    vec![
        obj(vec![
            ("label", s("Retries")),
            ("type", s("String")),
            ("group", s("retries")),
            ("value", s("3")),
            (
                "binding",
                v(json!({ "type": "zeebe:taskDefinition", "property": "retries" })),
            ),
            ("constraints", v(json!({ "notEmpty": true }))),
        ]),
        obj(vec![
            ("label", s("Retry backoff")),
            (
                "description",
                s("ISO 8601 duration, e.g. PT5S for 5 seconds"),
            ),
            ("type", s("String")),
            ("group", s("retries")),
            ("value", s("PT0S")),
            ("feel", s("static")),
            ("optional", v(json!(true))),
            ("binding", header("retryBackoff")),
        ]),
    ]
}

fn standard_groups() -> Vec<Value> {
    vec![
        json!({ "id": "endpoint", "label": "HTTP Endpoint" }),
        json!({ "id": "authentication", "label": "Authentication" }),
        json!({ "id": "timeout", "label": "Timeout", "openByDefault": false }),
        json!({ "id": "payload", "label": "Payload" }),
        json!({ "id": "output", "label": "Output Mapping" }),
        json!({ "id": "errors", "label": "Error Handling" }),
        json!({ "id": "retries", "label": "Retries", "openByDefault": false }),
    ]
}

// ─── Main builder ───────────────────────────────────────────────────────────────

/// One element template for one operation (`buildTemplate`).
pub fn build_template(op: &OperationWithMeta, opts: &GeneratorOptions) -> Value {
    let name = operation_name(op);
    let summary = get(&op.operation, "summary");
    let display_name = match summary.filter(|v| truthy(v)) {
        Some(sm) => sm.clone(),
        None => Value::String(to_display_name(&name)),
    };
    let template_id = format!("{}.{}", opts.id_prefix, slugify(&name));

    let mut properties = vec![
        obj(vec![
            ("type", s("Hidden")),
            ("value", s("io.camunda:http-json:1")),
            (
                "binding",
                v(json!({ "type": "zeebe:taskDefinition", "property": "type" })),
            ),
        ]),
        obj(vec![
            ("type", s("Hidden")),
            ("value", s(&op.method.to_uppercase())),
            ("binding", input("method")),
        ]),
        build_url_field(op, opts.base_url.as_deref()),
    ];
    properties.extend(op.path_params.iter().map(build_path_param_field));
    properties.push(build_query_params_field(&op.query_params));
    properties.push(build_headers_field(&op.header_params));
    properties.extend(build_body_fields(op, opts.expand_body));
    properties.extend(build_auth_block(
        opts.default_auth_type.unwrap_or(AuthHint::NoAuth),
    ));
    properties.extend(build_timeout_block());
    properties.extend(build_output_block(op.response_schema.as_ref()));
    properties.extend(build_error_block());
    properties.extend(build_retry_block());

    let has_payload = properties.iter().any(|p| p["group"] == "payload");
    let groups: Vec<Value> = standard_groups()
        .into_iter()
        .filter(|g| has_payload || g["id"] != "payload")
        .collect();

    obj(vec![
        ("$schema", s(CONNECTOR_SCHEMA)),
        ("name", Some(display_name)),
        ("id", s(&template_id)),
        ("version", v(json!(1))),
        (
            "description",
            nullish(get(&op.operation, "description"), summary).cloned(),
        ),
        (
            "documentationRef",
            get_opt(get(&op.operation, "externalDocs"), "url").cloned(),
        ),
        (
            "category",
            v(json!({ "id": "connectors", "name": "Connectors" })),
        ),
        ("appliesTo", v(json!(["bpmn:Task"]))),
        ("elementType", v(json!({ "value": "bpmn:ServiceTask" }))),
        ("groups", Some(Value::Array(groups))),
        ("properties", Some(Value::Array(properties))),
        (
            "icon",
            opts.icon
                .as_deref()
                .filter(|i| !i.is_empty())
                .map(|i| json!({ "contents": i })),
        ),
    ])
}

/// `buildTemplates`.
pub fn build_templates(ops: &[OperationWithMeta], opts: &GeneratorOptions) -> Vec<Value> {
    ops.iter().map(|op| build_template(op, opts)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_names_and_slugs() {
        assert_eq!(to_display_name("listRepoIssues"), "List Repo Issues");
        assert_eq!(to_display_name("list-repo__issues"), "List Repo Issues");
        assert_eq!(to_display_name("aBcD"), "A Bc D");
        assert_eq!(to_display_name("éa b"), "éA B");
        assert_eq!(slugify("--List Repo/Issues!!"), "list-repo-issues");
    }

    #[test]
    fn path_splitting_keeps_empty_text_pieces() {
        assert_eq!(split_path("/a/{x}/b"), ["/a/", "{x}", "/b"]);
        assert_eq!(split_path("/{x}"), ["/", "{x}", ""]);
        assert_eq!(split_path("/a/{}/b"), ["/a/{}/b"]);
        assert_eq!(split_path("{{a}"), ["", "{{a}", ""]);
        assert_eq!(split_path("/a/{b"), ["/a/{b"]);
    }

    fn op(path: &str, method: &'static str, params: Vec<Value>) -> OperationWithMeta {
        OperationWithMeta {
            path: path.into(),
            method,
            operation: json!({}),
            base_url: "https://h".into(),
            path_params: params,
            query_params: vec![],
            header_params: vec![],
            request_body_schema: None,
            response_schema: None,
        }
    }

    #[test]
    fn url_field_repeats_the_base_for_every_text_piece() {
        let f = build_url_field(&op("/r/{id}", "get", vec![json!({ "name": "id" })]), None);
        assert_eq!(f["value"], "=\"https://h/r/\" + id + \"https://h\"");
        let hidden = build_url_field(&op("/r", "get", vec![]), Some("http://o/"));
        assert_eq!(hidden["value"], "http://o/r");
        assert_eq!(hidden["type"], "Hidden");
    }

    #[test]
    fn operation_name_falls_back_to_method_and_path() {
        assert_eq!(operation_name(&op("/a/{b}/c", "get", vec![])), "get_a_b_c");
        assert_eq!(operation_name(&op("/{}", "get", vec![])), "get_");
    }

    #[test]
    fn templates_carry_payload_only_for_body_methods() {
        let opts = GeneratorOptions::new("p");
        let get = build_template(&op("/x", "get", vec![]), &opts);
        assert!(get["groups"]
            .as_array()
            .unwrap()
            .iter()
            .all(|g| g["id"] != "payload"));
        assert!(get.get("description").is_none());
        let post = build_template(&op("/x", "post", vec![]), &opts);
        assert!(post["groups"]
            .as_array()
            .unwrap()
            .iter()
            .any(|g| g["id"] == "payload"));
        assert_eq!(post["id"], "p.post-x");
    }
}
