//! The "API index" of a spec: base URL, authentication and a compact line per operation, as
//! `@bpmnkit/connector-gen/api-index` keeps it (`ApiService`). Port of the pure functions of
//! `scripts/build-api-index.mjs` (now `scripts/api-index-ops.mjs`), plus per-operation facts the
//! worker rules (`bpmnkit-jobspec`, R5-R7/R11) need and the TS index lacks.
//!
//! Unlike [`crate::parse_openapi`], the document is read raw: Swagger 2.0 is not upgraded, as in
//! the TS index, which has its own Swagger branches.
//!
//! # Fields
//! TS fields, in TS key order: `method`, `path`, then `summary` or (without summary) `id`, then
//! `query`, `headers`, `body`, `form`. Service: `id`, `name`, `baseUrl`, `auth`, `operations`
//! (no `license`: that gate belongs to the catalog build).
//!
//! Rust-only fields, appended after those and omitted when default:
//! - `id`: always the `operationId` when there is one. TS drops it when a summary exists; jobspec
//!   resolves `<service>#<operationId>` through `id`, so the generator keeps it. Parity tests
//!   strip `id` from operations that have a `summary`.
//! - `auth` `{type}`: the operation's own `security` (not the document default), mapped like the
//!   service auth plus `sigv4` (`x-amazon-apigateway-authtype: awsSigv4`) and other `http`
//!   schemes by name (`hmac`, ...); empty `security: []` is `noAuth`. Omitted when equal to the
//!   service auth or when no scheme is recognised.
//! - `requestMediaTypes`: request body content types (Swagger: `consumes` of the operation, else
//!   the document, only for operations with a body or form parameter).
//! - `responseMediaTypes`: content types of the 2xx and `default` responses (Swagger: `produces`).
//! - `responseKeys`: top-level property names of the first 2xx JSON response schema, `allOf`
//!   merged; `responseList`: that schema is an array.
//! - `linkHeader`: a 2xx response documents a `Link` header.
//! - `x-bpmnkit-paginate`: the operation carries that extension as `true`.
//!
//! Arrays are sorted and deduplicated.

use std::collections::BTreeSet;

use bpmnkit_bpmn::js::is_js_space;
use indexmap::IndexMap;
use regex::Regex;
use serde_json::{json, Map, Value};

use crate::error::Error;
use crate::jsval::{get, get_opt, js_string, nullish, replace_first, truthy, truthy_opt};
use crate::openapi::parse_raw;
use crate::AuthHint;

const METHODS: [&str; 5] = ["get", "post", "put", "patch", "delete"];
const MAX_SUMMARY_WORDS: usize = 12;
/// Body properties and query parameters shown per operation, required ones first.
const MAX_FIELDS: usize = 6;
const COMMON: [&str; 11] = [
    "name",
    "title",
    "email",
    "text",
    "content",
    "description",
    "amount",
    "currency",
    "status",
    "message",
    "body",
];

fn percent_decode(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let hex = s.get(i + 1..i + 3)?;
            out.push(u8::from_str_radix(hex, 16).ok()?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

/// Follows local `$ref`s; `None` for an external or circular one (TS `undefined`).
fn deref(doc: &Value, value: &Value) -> Option<Value> {
    let mut seen = BTreeSet::new();
    let mut value = value.clone();
    loop {
        let Some(Value::String(reference)) = get(&value, "$ref") else {
            return Some(value);
        };
        let pointer = reference.strip_prefix("#/")?;
        if !seen.insert(reference.clone()) {
            return None;
        }
        let mut current = doc;
        for part in pointer.split('/') {
            let key = percent_decode(&part.replace("~1", "/").replace("~0", "~"))?;
            current = match current {
                Value::Object(m) => m.get(&key)?,
                Value::Array(a) => a.get(key.parse::<usize>().ok()?)?,
                _ => return None,
            };
        }
        value = current.clone();
    }
}

fn deref_opt(doc: &Value, value: Option<&Value>) -> Option<Value> {
    value.and_then(|v| deref(doc, v))
}

fn schema_or_param(doc: &Value, p: &Value) -> Value {
    deref_opt(doc, get(p, "schema"))
        .filter(|v| !v.is_null())
        .unwrap_or_else(|| p.clone())
}

/// Top-level properties of a schema, `allOf` parts merged; required names.
fn properties(
    doc: &Value,
    schema: Option<&Value>,
    depth: usize,
) -> (Vec<String>, BTreeSet<String>) {
    let Some(s) = deref_opt(doc, schema).filter(|s| s.is_object() && truthy(s)) else {
        return Default::default();
    };
    if depth > 4 {
        return Default::default();
    }
    let mut names: Vec<String> = match get(&s, "properties") {
        Some(Value::Object(m)) => m.keys().cloned().collect(),
        _ => vec![],
    };
    let mut required: BTreeSet<String> = match get(&s, "required") {
        Some(Value::Array(a)) => a.iter().map(|r| js_string(Some(r))).collect(),
        _ => Default::default(),
    };
    if let Some(Value::Array(parts)) = get(&s, "allOf") {
        for part in parts {
            let (inner, inner_required) = properties(doc, Some(part), depth + 1);
            names.extend(inner);
            required.extend(inner_required);
        }
    }
    let mut seen = BTreeSet::new();
    names.retain(|n| seen.insert(n.clone()));
    (names, required)
}

fn fields(names: &[String], required: &BTreeSet<String>) -> Vec<String> {
    let rank = |n: &String| {
        if required.contains(n) {
            -1
        } else {
            COMMON
                .iter()
                .position(|c| c == n)
                .map_or(COMMON.len() as i32, |i| i as i32)
        }
    };
    let mut ordered: Vec<&String> = names.iter().collect();
    ordered.sort_by_key(|n| rank(n));
    ordered
        .into_iter()
        .take(MAX_FIELDS)
        .map(|n| {
            if required.contains(n) {
                format!("{n}*")
            } else {
                n.clone()
            }
        })
        .collect()
}

/// A tenant's own host: the URL is the caller's to give.
fn placeholder_host() -> Regex {
    Regex::new(
        r"(?i)your[-_]?(domain|instance|site|company)|example\.|subdomain|store_hash|^server\.|_id\b|consulting|^demo\.|\.local$|apiblueprint",
    )
    .expect("static regex")
}

fn absolute(url: &str) -> Option<String> {
    let host = Regex::new(r"^https?://([^/{}\s]+)").expect("static regex");
    let m = host.captures(url)?.get(1)?;
    // A bot token in the path (Telegram) is a credential, not a base URL
    let bot = Regex::new(r"/bot\d+:").expect("static regex");
    if placeholder_host().is_match(m.as_str()) || bot.is_match(url) {
        return None;
    }
    Some(url.strip_suffix('/').unwrap_or(url).to_owned())
}

fn is_swagger(doc: &Value) -> bool {
    truthy_opt(get(doc, "swagger"))
}

fn base_url_of(doc: &Value) -> Option<String> {
    if is_swagger(doc) {
        let host = get(doc, "host").filter(|h| truthy(h))?;
        let scheme = match get(doc, "schemes") {
            None | Some(Value::Null) => "https".to_owned(),
            Some(Value::Array(a)) if a.iter().any(|s| s == "https") => "https".to_owned(),
            Some(Value::Array(a)) => js_string(a.first()),
            Some(_) => "undefined".to_owned(),
        };
        let base = match get(doc, "basePath") {
            None | Some(Value::Null) => String::new(),
            some => js_string(some),
        };
        return absolute(&format!("{scheme}://{}{base}", js_string(Some(host))));
    }
    let server = get(doc, "servers")?.as_array()?.first()?;
    let mut url = js_string(Some(get(server, "url").filter(|u| truthy(u))?));
    if let Some(Value::Object(vars)) = get(server, "variables") {
        for (key, variable) in vars {
            if let Some(d) = get(variable, "default") {
                url = replace_first(&url, &format!("{{{key}}}"), &js_string(Some(d)));
            }
        }
    }
    absolute(&url)
}

fn s<'a>(v: &'a Value, key: &str) -> Option<&'a str> {
    get(v, key).and_then(Value::as_str)
}

/// `bearer`, then API key, then basic, then client credentials, as the TS `authOf` prefers.
fn auth_of_schemes(schemes: &[Value]) -> Option<Value> {
    let is_bearer = |x: &&Value| {
        s(x, "type") == Some("http")
            && get(x, "scheme").map(|v| js_string(Some(v)).to_lowercase()) == Some("bearer".into())
    };
    if schemes.iter().any(|x| is_bearer(&x)) {
        return Some(json!({ "type": "bearer" }));
    }
    let key = schemes
        .iter()
        .find(|x| s(x, "type") == Some("apiKey") && matches!(s(x, "in"), Some("header" | "query")));
    if let Some(key) = key {
        let name = get(key, "name");
        // An "Authorization" key is a token by another name
        if s(key, "in") == Some("header")
            && name.is_some_and(|n| js_string(Some(n)).eq_ignore_ascii_case("authorization"))
        {
            return Some(json!({ "type": "bearer" }));
        }
        let mut out = Map::new();
        out.insert("type".into(), "apiKey".into());
        out.insert("in".into(), get(key, "in").cloned().unwrap_or(Value::Null));
        if let Some(n) = name {
            out.insert("name".into(), n.clone());
        }
        return Some(Value::Object(out));
    }
    if schemes.iter().any(|x| {
        (s(x, "type") == Some("http") && s(x, "scheme") == Some("basic"))
            || s(x, "type") == Some("basic")
    }) {
        return Some(json!({ "type": "basic" }));
    }
    if schemes.iter().any(|x| {
        s(x, "type") == Some("oauth2")
            && (truthy_opt(get_opt(get(x, "flows"), "clientCredentials"))
                || s(x, "flow") == Some("application"))
    }) {
        return Some(json!({ "type": "oauth-client-credentials-flow" }));
    }
    None
}

fn scheme_table(doc: &Value) -> Option<&serde_json::Map<String, Value>> {
    let table = if is_swagger(doc) {
        get(doc, "securityDefinitions")
    } else {
        get_opt(get(doc, "components"), "securitySchemes")
    };
    table?.as_object()
}

fn auth_of(doc: &Value, fallback: AuthHint) -> Value {
    let schemes: Vec<Value> = scheme_table(doc)
        .into_iter()
        .flatten()
        .filter_map(|(_, v)| deref(doc, v))
        .filter(truthy)
        .collect();
    auth_of_schemes(&schemes).unwrap_or_else(|| json!({ "type": fallback.as_str() }))
}

/// The auth an operation's own `security` names, or `None` when it has none or names nothing known.
fn operation_auth(doc: &Value, op: &Value) -> Option<Value> {
    let requirements = get(op, "security")?.as_array()?;
    if requirements.is_empty() {
        return Some(json!({ "type": "noAuth" }));
    }
    let table = scheme_table(doc)?;
    let schemes: Vec<Value> = requirements
        .iter()
        .filter_map(Value::as_object)
        .flat_map(|r| r.keys())
        .filter_map(|name| table.get(name).and_then(|v| deref(doc, v)))
        .filter(truthy)
        .collect();
    // SigV4 declares itself as an `Authorization` API key, which would read as a bearer token
    let sigv4 = schemes.iter().any(|x| {
        get(x, "x-amazon-apigateway-authtype").and_then(Value::as_str) == Some("awsSigv4")
    });
    if sigv4 {
        return Some(json!({ "type": "sigv4" }));
    }
    auth_of_schemes(&schemes).or_else(|| {
        schemes.iter().find_map(|x| {
            (s(x, "type") == Some("http"))
                .then(|| s(x, "scheme"))
                .flatten()
                .map(|n| json!({ "type": n.to_lowercase() }))
        })
    })
}

fn summary_of(op: &Value) -> Option<String> {
    let text =
        js_string(nullish(get(op, "summary"), get(op, "description")).or(Some(&Value::from(""))));
    let first = text.split('\n').next().unwrap_or_default();
    let stripped: String = first.chars().filter(|c| !"`*_[]".contains(*c)).collect();
    let parens = Regex::new(r"\(([^)]*)\)").expect("static regex");
    let cleaned = parens.replace_all(&stripped, "");
    let words: Vec<&str> = cleaned
        .split(is_js_space)
        .filter(|w| !w.is_empty())
        .collect();
    if words.is_empty() {
        return None;
    }
    Some(if words.len() > MAX_SUMMARY_WORDS {
        format!("{}…", words[..MAX_SUMMARY_WORDS].join(" "))
    } else {
        let joined = words.join(" ");
        joined
            .strip_suffix('.')
            .map_or(joined.clone(), str::to_owned)
    })
}

fn sorted_set(items: impl IntoIterator<Item = String>) -> Vec<Value> {
    items
        .into_iter()
        .collect::<BTreeSet<_>>()
        .into_iter()
        .map(Value::String)
        .collect()
}

fn content_types(content: Option<&Value>) -> Vec<String> {
    match content {
        Some(Value::Object(m)) => m.keys().cloned().collect(),
        _ => vec![],
    }
}

fn string_list(v: Option<&Value>) -> Vec<String> {
    match v {
        Some(Value::Array(a)) => a.iter().map(|x| js_string(Some(x))).collect(),
        _ => vec![],
    }
}

/// `2xx` status keys of a `responses` object, in document order, then `default` last.
fn success_responses(doc: &Value, op: &Value) -> (Vec<Value>, Option<Value>) {
    let mut ok = vec![];
    let mut default = None;
    if let Some(Value::Object(m)) = get(op, "responses") {
        for (code, r) in m {
            let upper = code.to_ascii_uppercase();
            let is_2xx = upper.len() == 3
                && upper.starts_with('2')
                && upper[1..].chars().all(|c| c.is_ascii_digit() || c == 'X');
            if is_2xx {
                ok.extend(deref(doc, r));
            } else if code == "default" {
                default = deref(doc, r);
            }
        }
    }
    (ok, default)
}

fn json_schema_of(response: &Value, swagger: bool) -> Option<Value> {
    if swagger {
        return get(response, "schema").cloned();
    }
    let Some(Value::Object(content)) = get(response, "content") else {
        return None;
    };
    let ty = content.keys().find(|t| t.contains("json"))?;
    get(&content[ty], "schema").cloned()
}

fn is_array_schema(doc: &Value, schema: &Value) -> bool {
    deref(doc, schema).is_some_and(|s| {
        get(&s, "type").and_then(Value::as_str) == Some("array")
            || (get(&s, "type").is_none() && get(&s, "items").is_some())
    })
}

/// The Rust-only facts of one operation, in field order.
fn extra_facts(
    doc: &Value,
    op: &Value,
    params_have_body: bool,
    service_auth: &Value,
) -> Vec<(&'static str, Value)> {
    let swagger = is_swagger(doc);
    let mut out = vec![];
    if let Some(auth) = operation_auth(doc, op).filter(|a| a != service_auth) {
        out.push(("auth", auth));
    }
    let request = if swagger {
        if params_have_body {
            string_list(nullish(get(op, "consumes"), get(doc, "consumes")))
        } else {
            vec![]
        }
    } else {
        content_types(
            deref_opt(doc, get(op, "requestBody"))
                .as_ref()
                .and_then(|b| get(b, "content")),
        )
    };
    let (ok, default) = success_responses(doc, op);
    let response: Vec<String> = if swagger {
        if ok.is_empty() && default.is_none() {
            vec![]
        } else {
            string_list(nullish(get(op, "produces"), get(doc, "produces")))
        }
    } else {
        ok.iter()
            .chain(default.iter())
            .flat_map(|r| content_types(get(r, "content")))
            .collect()
    };
    let schema = ok.iter().find_map(|r| json_schema_of(r, swagger));
    let (keys, list) = match &schema {
        Some(sc) => (properties(doc, Some(sc), 0).0, is_array_schema(doc, sc)),
        None => (vec![], false),
    };
    let link = ok.iter().any(|r| {
        matches!(get(r, "headers"), Some(Value::Object(h)) if h.keys().any(|k| k.eq_ignore_ascii_case("link")))
    });
    let paginate = get(op, "x-bpmnkit-paginate") == Some(&Value::Bool(true));
    let mut arrays = vec![
        ("requestMediaTypes", sorted_set(request)),
        ("responseMediaTypes", sorted_set(response)),
        ("responseKeys", sorted_set(keys)),
    ];
    arrays.retain(|(_, v)| !v.is_empty());
    out.extend(arrays.into_iter().map(|(k, v)| (k, Value::Array(v))));
    if list {
        out.push(("responseList", true.into()));
    }
    if link {
        out.push(("linkHeader", true.into()));
    }
    if paginate {
        out.push(("x-bpmnkit-paginate", true.into()));
    }
    out
}

fn header_entry(doc: &Value, p: &Value) -> String {
    let name = js_string(get(p, "name"));
    let schema = schema_or_param(doc, p);
    let first_enum = get(&schema, "enum")
        .and_then(Value::as_array)
        .and_then(|a| a.first());
    let value = [
        get(&schema, "default"),
        first_enum,
        get(p, "example"),
        get(&schema, "example"),
    ]
    .into_iter()
    .fold(None, nullish);
    match value {
        None | Some(Value::Null) => name,
        some => format!("{name}: {}", js_string(some)),
    }
}

fn operations_of(doc: &Value, service_auth: &Value) -> Vec<Value> {
    let mut out = vec![];
    let Some(Value::Object(paths)) = get(doc, "paths") else {
        return out;
    };
    let swagger = is_swagger(doc);
    let skip_header =
        Regex::new(r"(?i)^(authorization|content-type|accept)$").expect("static regex");
    for (path, raw_item) in paths {
        let Some(item) = deref(doc, raw_item).filter(|i| i.is_object()) else {
            continue;
        };
        for method in METHODS {
            let Some(op) = get(&item, method).filter(|o| truthy(o)) else {
                continue;
            };
            if truthy_opt(get(op, "deprecated")) {
                continue;
            }
            let list = |v: &Value| match get(v, "parameters") {
                None | Some(Value::Null) => Some(vec![]),
                Some(Value::Array(a)) => Some(a.clone()),
                Some(_) => None,
            };
            // A malformed parameter list skips the operation, as the TS `try` does
            let (Some(a), Some(b)) = (list(&item), list(op)) else {
                continue;
            };
            let mut by_name: IndexMap<String, Value> = IndexMap::new();
            for p in a.iter().chain(b.iter()).filter_map(|p| deref(doc, p)) {
                if truthy_opt(get(&p, "name")) {
                    by_name.insert(
                        format!(
                            "{}:{}",
                            js_string(get(&p, "in")),
                            js_string(get(&p, "name"))
                        ),
                        p,
                    );
                }
            }
            let all: Vec<&Value> = by_name.values().collect();
            let in_ =
                |loc: &'static str| all.iter().copied().filter(move |p| s(p, "in") == Some(loc));
            let query: Vec<&Value> = in_("query").collect();
            let query_names: Vec<String> =
                query.iter().map(|p| js_string(get(p, "name"))).collect();
            let query_required: BTreeSet<String> = query
                .iter()
                .filter(|p| truthy_opt(get(p, "required")))
                .map(|p| js_string(get(p, "name")))
                .collect();
            let headers: Vec<String> = in_("header")
                .filter(|p| {
                    truthy_opt(get(p, "required"))
                        && !skip_header.is_match(&js_string(get(p, "name")))
                })
                .map(|p| header_entry(doc, p))
                .collect();

            let mut body = vec![];
            let mut form = false;
            let mut has_body = false;
            if swagger {
                if let Some(in_body) = in_("body").next() {
                    has_body = true;
                    let (names, required) = properties(doc, get(in_body, "schema"), 0);
                    body = fields(&names, &required);
                }
                let form_data: Vec<&Value> = in_("formData").collect();
                if !form_data.is_empty() {
                    has_body = true;
                    form = true;
                    let names: Vec<String> = form_data
                        .iter()
                        .map(|p| js_string(get(p, "name")))
                        .collect();
                    let required = form_data
                        .iter()
                        .filter(|p| truthy_opt(get(p, "required")))
                        .map(|p| js_string(get(p, "name")))
                        .collect();
                    body = fields(&names, &required);
                }
            } else if let Some(Value::Object(content)) = deref_opt(doc, get(op, "requestBody"))
                .as_ref()
                .and_then(|b| get(b, "content"))
            {
                let ty = content
                    .keys()
                    .find(|t| t.contains("json"))
                    .or_else(|| content.keys().next());
                if let Some(ty) = ty {
                    form = ty == "application/x-www-form-urlencoded";
                    let (names, required) = properties(doc, get(&content[ty], "schema"), 0);
                    body = fields(&names, &required);
                }
            }

            let mut entry = Map::new();
            entry.insert("method".into(), method.to_uppercase().into());
            entry.insert("path".into(), path.clone().into());
            // The operation id only where there is no summary: it is mostly the summary's words
            let summary = summary_of(op);
            let id = get(op, "operationId")
                .filter(|i| truthy(i))
                .map(|i| js_string(Some(i)));
            match (&summary, &id) {
                (Some(sum), _) => entry.insert("summary".into(), sum.clone().into()),
                (None, Some(id)) => entry.insert("id".into(), id.clone().into()),
                _ => None,
            };
            let query_fields = fields(&query_names, &query_required);
            if !query_fields.is_empty() {
                entry.insert("query".into(), json!(query_fields));
            }
            if !headers.is_empty() {
                entry.insert("headers".into(), json!(headers));
            }
            if !body.is_empty() {
                entry.insert("body".into(), json!(body));
                if form {
                    entry.insert("form".into(), true.into());
                }
            }
            // Rust-only from here on; see the module doc
            if let (Some(_), Some(id)) = (&summary, &id) {
                entry.insert("id".into(), id.clone().into());
            }
            for (k, v) in extra_facts(doc, op, has_body, service_auth) {
                entry.insert(k.into(), v);
            }
            out.push(Value::Object(entry));
        }
    }
    out
}

/// Builds the API-index service of a spec: `{id, name, baseUrl?, auth, operations}`.
///
/// `spec_text` is JSON or YAML, OpenAPI 3 or Swagger 2 (read as is, not upgraded). `fallback` is
/// the auth type of a spec that declares no recognisable scheme (the catalog's `defaultAuth`;
/// `ApiKey` becomes `noAuth`, as in TS). Operations are `get`/`post`/`put`/`patch`/`delete` that are
/// not deprecated; the Rust-only per-operation fields are described in the module docs.
pub fn api_service(
    spec_text: &str,
    id: &str,
    name: &str,
    fallback: AuthHint,
) -> Result<Value, Error> {
    let doc = parse_raw(spec_text)?;
    if !doc.is_object() {
        return Err(Error::Spec(
            "Invalid OpenAPI document: must be an object".into(),
        ));
    }
    let fallback = if fallback == AuthHint::ApiKey {
        AuthHint::NoAuth
    } else {
        fallback
    };
    let auth = auth_of(&doc, fallback);
    let mut service = Map::new();
    service.insert("id".into(), id.into());
    service.insert("name".into(), name.into());
    if let Some(base) = base_url_of(&doc) {
        service.insert("baseUrl".into(), base.into());
    }
    let operations = operations_of(&doc, &auth);
    service.insert("auth".into(), auth);
    service.insert("operations".into(), Value::Array(operations));
    Ok(Value::Object(service))
}
