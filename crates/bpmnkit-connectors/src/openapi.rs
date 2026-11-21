//! Reading an OpenAPI 3 / Swagger 2 document into the operations the generator walks: port of
//! `parse-openapi.ts`. The document stays a `serde_json::Value`, as plain JS data does in TS.

use crate::error::Error;
use crate::jsval::{
    get, get_opt, js_string, normalize, nullish, replace_first, truthy, truthy_opt,
};
use crate::swagger2::{is_swagger2, upgrade_swagger2};
use bpmnkit_bpmn::js::is_js_space;
use indexmap::IndexMap;
use serde_json::Value;

type Result<T> = std::result::Result<T, Error>;

/// The HTTP methods an operation can sit under, in the order the generator visits them.
pub const HTTP_METHODS: [&str; 8] = [
    "get", "post", "put", "patch", "delete", "head", "options", "trace",
];

/// One operation with the pieces template generation needs (`OperationWithMeta`).
#[derive(Debug, Clone)]
pub struct OperationWithMeta {
    pub path: String,
    pub method: &'static str,
    pub operation: Value,
    pub base_url: String,
    pub path_params: Vec<Value>,
    pub query_params: Vec<Value>,
    pub header_params: Vec<Value>,
    pub request_body_schema: Option<Value>,
    pub response_schema: Option<Value>,
}

/// The auth type a spec's security schemes suggest.
pub type DetectedAuth = crate::AuthHint;

fn is_ref(v: &Value) -> bool {
    get(v, "$ref").is_some_and(Value::is_string)
}

/// Follows one local `#/...` pointer.
pub fn resolve_ref(doc: &Value, reference: &str) -> Result<Value> {
    let Some(pointer) = reference.strip_prefix("#/") else {
        return Err(Error::Spec(format!(
            "External $ref not supported: \"{reference}\". Only local #/ refs are resolved."
        )));
    };
    let mut current = doc;
    for part in pointer.split('/') {
        let decoded = part.replace("~1", "/").replace("~0", "~");
        let next = match current {
            Value::Object(m) => m.get(&decoded),
            Value::Array(a) => decoded.parse::<usize>().ok().and_then(|i| a.get(i)),
            _ => {
                return Err(Error::Spec(format!(
                    "Cannot resolve $ref \"{reference}\": path segment \"{part}\" is not an object"
                )))
            }
        };
        current = next.ok_or_else(|| {
            Error::Spec(format!(
                "Cannot resolve $ref \"{reference}\": key \"{decoded}\" not found"
            ))
        })?;
    }
    Ok(current.clone())
}

/// A value that may be a `$ref` or concrete; refs are followed once.
pub fn resolve(doc: &Value, v: &Value) -> Result<Value> {
    match get(v, "$ref") {
        Some(Value::String(r)) if is_ref(v) => resolve_ref(doc, r),
        _ => Ok(v.clone()),
    }
}

fn yaml_to_json(y: &yaml_rust2::Yaml) -> Value {
    use yaml_rust2::Yaml;
    match y {
        Yaml::Null | Yaml::BadValue | Yaml::Alias(_) => Value::Null,
        Yaml::Boolean(b) => Value::Bool(*b),
        Yaml::Integer(i) => Value::from(*i),
        Yaml::Real(s) => {
            let f = bpmnkit_bpmn::js::js_number(s);
            serde_json::Number::from_f64(f).map_or(Value::Null, Value::Number)
        }
        Yaml::String(s) => Value::String(s.clone()),
        Yaml::Array(a) => Value::Array(a.iter().map(yaml_to_json).collect()),
        Yaml::Hash(h) => {
            let mut m = serde_json::Map::new();
            for (k, v) in h {
                // JS object keys are strings: `200:` becomes "200".
                let key = match k {
                    Yaml::String(s) => s.clone(),
                    other => js_string(Some(&yaml_to_json(other))),
                };
                m.insert(key, yaml_to_json(v));
            }
            Value::Object(m)
        }
    }
}

fn parse_spec_text(text: &str) -> Result<Value> {
    let trimmed = text.trim_start_matches(is_js_space);
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        return serde_json::from_str(text)
            .map_err(|e| Error::Spec(format!("Failed to parse OpenAPI JSON: {e}")));
    }
    let docs = yaml_rust2::YamlLoader::load_from_str(text)
        .map_err(|e| Error::Spec(format!("Failed to parse OpenAPI YAML: {e}")))?;
    match docs.as_slice() {
        [] => Ok(Value::Null),
        [one] => Ok(yaml_to_json(one)),
        _ => Err(Error::Spec(
            "Failed to parse OpenAPI YAML: Source contains multiple documents".into(),
        )),
    }
}

/// Parses JSON or YAML spec text; Swagger 2.0 is upgraded to OpenAPI 3 here so every caller
/// works with one shape.
pub fn parse_openapi(text: &str) -> Result<Value> {
    let mut doc = parse_spec_text(text)?;
    normalize(&mut doc);
    if is_swagger2(&doc) {
        if let Value::Object(m) = &doc {
            let mut up = Value::Object(upgrade_swagger2(m));
            normalize(&mut up);
            return Ok(up);
        }
    }
    Ok(doc)
}

/// The first server's URL with its variables expanded, without a trailing slash; `override_url`
/// wins when non-empty.
pub fn get_base_url(doc: &Value, override_url: Option<&str>) -> String {
    let strip = |s: &str| s.strip_suffix('/').unwrap_or(s).to_owned();
    if let Some(o) = override_url.filter(|o| !o.is_empty()) {
        return strip(o);
    }
    let Some(server) = get(doc, "servers")
        .and_then(Value::as_array)
        .and_then(|a| a.first())
    else {
        return String::new();
    };
    let mut url = strip(&js_string(get(server, "url")));
    if let Some(Value::Object(vars)) = get(server, "variables") {
        for (key, variable) in vars {
            url = replace_first(
                &url,
                &format!("{{{key}}}"),
                &js_string(get(variable, "default")),
            );
        }
    }
    url
}

fn param_key(p: &Value) -> String {
    format!("{}:{}", js_string(get(p, "in")), js_string(get(p, "name")))
}

fn resolve_parameters(doc: &Value, path_item: &Value, operation: &Value) -> Result<Vec<Value>> {
    let list = |v: &Value| -> Vec<Value> {
        get(v, "parameters")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default()
    };
    let mut map: IndexMap<String, Value> = IndexMap::new();
    for item in list(path_item).iter().chain(list(operation).iter()) {
        let p = resolve(doc, item)?;
        map.insert(param_key(&p), p);
    }
    Ok(map.into_values().collect())
}

fn resolve_body_schema(doc: &Value, request_body: Option<&Value>) -> Result<Option<Value>> {
    let Some(rb) = request_body.filter(|v| truthy(v)) else {
        return Ok(None);
    };
    let body = resolve(doc, rb)?;
    let Some(Value::Object(content)) = get(&body, "content") else {
        return Err(Error::Spec(
            "Cannot read properties of undefined (reading 'application/json')".into(),
        ));
    };
    let schema = content
        .get("application/json")
        .and_then(|j| get(j, "schema"))
        .filter(|s| truthy(s));
    Ok(schema.and_then(|s| resolve(doc, s).ok()))
}

fn resolve_response_schema(doc: &Value, responses: Option<&Value>) -> Option<Value> {
    let responses = responses.filter(|v| truthy(v))?;
    let ok = ["200", "201", "2XX", "default"]
        .iter()
        .fold(None, |acc, k| nullish(acc, get(responses, k)))?;
    let resp = resolve(doc, ok).ok()?;
    let schema = get(&resp, "content")
        .and_then(|c| get(c, "application/json"))
        .and_then(|j| get(j, "schema"))
        .filter(|s| truthy(s))?;
    resolve(doc, schema).ok()
}

fn validate_doc(doc: &Value) -> Result<()> {
    if !doc.is_object() {
        return Err(Error::Spec(
            "Invalid OpenAPI document: must be an object".into(),
        ));
    }
    let Some(version) = nullish(get(doc, "openapi"), get(doc, "swagger")).and_then(Value::as_str)
    else {
        return Err(Error::Spec(
            "Invalid OpenAPI document: missing `openapi` version field".into(),
        ));
    };
    if version.starts_with("2.") {
        return Err(Error::Spec(format!(
            "OpenAPI 2.x (Swagger) is not supported. Found version \"{version}\". Please convert to OpenAPI 3.x first (e.g. using https://editor.swagger.io)."
        )));
    }
    Ok(())
}

/// Every operation of the document, optionally filtered by a case-insensitive regex over
/// `"<operationId> <summary> <path>"`.
pub fn get_operations(doc: &Value, filter: Option<&str>) -> Result<Vec<OperationWithMeta>> {
    validate_doc(doc)?;
    let base_url = get_base_url(doc, None);
    let filter_re = match filter.filter(|f| !f.is_empty()) {
        Some(f) => Some(
            regex::RegexBuilder::new(f)
                .case_insensitive(true)
                .build()
                .map_err(|e| Error::Spec(format!("Invalid regular expression: /{f}/: {e}")))?,
        ),
        None => None,
    };
    let mut results = vec![];
    let Some(Value::Object(paths)) = get(doc, "paths") else {
        return Ok(results);
    };
    for (path, raw_item) in paths {
        let Ok(path_item) = resolve(doc, raw_item) else {
            continue;
        };
        for method in HTTP_METHODS {
            let Some(operation) = get(&path_item, method).filter(|o| truthy(o)) else {
                continue;
            };
            if let Some(re) = &filter_re {
                let text = |k: &str| match get(operation, k) {
                    None | Some(Value::Null) => String::new(),
                    some => js_string(some),
                };
                let haystack = format!("{} {} {path}", text("operationId"), text("summary"));
                if !re.is_match(&haystack) {
                    continue;
                }
            }
            let params = resolve_parameters(doc, &path_item, operation)?;
            let response_schema = resolve_response_schema(doc, get(operation, "responses"));
            let by = |loc: &str| -> Vec<Value> {
                params
                    .iter()
                    .filter(|p| get(p, "in").and_then(Value::as_str) == Some(loc))
                    .cloned()
                    .collect()
            };
            results.push(OperationWithMeta {
                path: path.clone(),
                method,
                operation: operation.clone(),
                base_url: base_url.clone(),
                path_params: by("path"),
                query_params: by("query"),
                header_params: by("header"),
                request_body_schema: resolve_body_schema(doc, get(operation, "requestBody"))?,
                response_schema,
            });
        }
    }
    Ok(results)
}

/// The auth type the first recognisable security scheme suggests, else `noAuth`.
pub fn detect_default_auth(doc: &Value) -> DetectedAuth {
    use crate::AuthHint::*;
    let Some(Value::Object(schemes)) = get_opt(get(doc, "components"), "securitySchemes") else {
        return NoAuth;
    };
    for raw in schemes.values() {
        let Ok(scheme) = resolve(doc, raw) else {
            continue;
        };
        let ty = get(&scheme, "type").and_then(Value::as_str);
        let name = get(&scheme, "scheme").and_then(Value::as_str);
        match (ty, name) {
            (Some("http"), Some("bearer")) => return Bearer,
            (Some("http"), Some("basic")) => return Basic,
            (Some("apiKey"), _) => return ApiKey,
            (Some("oauth2"), _)
                if truthy_opt(get_opt(get(&scheme, "flows"), "clientCredentials")) =>
            {
                return OauthClientCredentials
            }
            _ => {}
        }
    }
    NoAuth
}

/// The document's `servers` array, or empty.
pub fn get_servers(doc: &Value) -> Vec<Value> {
    get(doc, "servers")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn refs_resolve_locally_and_refuse_external() {
        let doc = json!({ "a": { "b/c": [10, { "d": 1 }] } });
        assert_eq!(resolve_ref(&doc, "#/a/b~1c/1/d").unwrap(), json!(1));
        assert!(resolve_ref(&doc, "#/a/zz")
            .unwrap_err()
            .to_string()
            .contains("key \"zz\" not found"));
        assert!(resolve_ref(&doc, "x.yaml#/a")
            .unwrap_err()
            .to_string()
            .starts_with("External $ref"));
        assert!(resolve_ref(&doc, "#/a/b~1c/0/q")
            .unwrap_err()
            .to_string()
            .contains("not an object"));
    }

    #[test]
    fn base_url_expands_variables_and_strips_one_slash() {
        let doc = json!({ "servers": [{ "url": "https://{h}.x/{h}/", "variables": { "h": { "default": "eu" } } }] });
        assert_eq!(get_base_url(&doc, None), "https://eu.x/{h}");
        assert_eq!(get_base_url(&doc, Some("http://o/")), "http://o");
        assert_eq!(get_base_url(&doc, Some("")), "https://eu.x/{h}");
        assert_eq!(get_base_url(&json!({}), None), "");
    }

    #[test]
    fn yaml_integer_keys_are_strings_in_js_order() {
        let doc = parse_openapi("openapi: 3.0.0\npaths:\n  b: 1\n  2: x\n  1.50: y\n").unwrap();
        // `openapi: 3.0.0` stays a string; `1.50` becomes the key "1.5".
        assert_eq!(doc["openapi"], "3.0.0");
        let keys: Vec<&String> = doc["paths"].as_object().unwrap().keys().collect();
        assert_eq!(keys, ["2", "b", "1.5"]);
    }

    #[test]
    fn invalid_documents_are_refused() {
        let msg = |s: &str| {
            let doc = parse_openapi(s).unwrap();
            get_operations(&doc, None).unwrap_err().to_string()
        };
        assert!(msg("{\"openapi\": 3}").contains("missing `openapi` version field"));
        assert!(msg("openapi: \"2.0\"").contains("OpenAPI 2.x (Swagger) is not supported"));
        assert!(parse_openapi("{")
            .unwrap_err()
            .to_string()
            .starts_with("Failed to parse OpenAPI JSON"));
        assert!(get_operations(&json!("x"), None)
            .unwrap_err()
            .to_string()
            .contains("must be an object"));
    }

    #[test]
    fn operations_merge_path_and_operation_parameters_and_filter() {
        let doc = json!({ "openapi": "3.0.0", "paths": { "/p/{id}": {
            "parameters": [{ "name": "id", "in": "path", "description": "path" }, { "name": "q", "in": "query" }],
            "get": { "operationId": "getP", "parameters": [{ "name": "id", "in": "path", "description": "op" }] },
            "post": { "summary": "Make it" }
        } } });
        let ops = get_operations(&doc, None).unwrap();
        assert_eq!(ops.len(), 2);
        assert_eq!(ops[0].path_params[0]["description"], "op");
        assert_eq!(ops[0].query_params.len(), 1);
        let filtered = get_operations(&doc, Some("MAKE")).unwrap();
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].method, "post");
        assert!(get_operations(&doc, Some("(")).is_err());
    }

    #[test]
    fn default_auth_follows_the_first_recognised_scheme() {
        let auth =
            |s: Value| detect_default_auth(&json!({ "components": { "securitySchemes": s } }));
        assert_eq!(
            auth(json!({ "a": { "type": "http", "scheme": "basic" }, "b": { "type": "apiKey" } })),
            crate::AuthHint::Basic
        );
        assert_eq!(
            auth(json!({ "a": { "type": "oauth2", "flows": { "implicit": {} } } })),
            crate::AuthHint::NoAuth
        );
        assert_eq!(
            auth(json!({ "a": { "type": "oauth2", "flows": { "clientCredentials": {} } } })),
            crate::AuthHint::OauthClientCredentials
        );
        assert_eq!(detect_default_auth(&json!({})), crate::AuthHint::NoAuth);
        assert_eq!(get_servers(&json!({ "servers": [{}] })).len(), 1);
    }
}
