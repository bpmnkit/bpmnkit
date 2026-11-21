//! Swagger 2.0 to OpenAPI 3 upgrade: port of `swagger2.ts`. Covers what the generator reads
//! (servers, schemas, parameters, JSON/form request bodies, JSON responses, security schemes);
//! anything else is carried over untouched.

use serde_json::{json, Map, Value};

type Json = Map<String, Value>;

const PARAM_SCHEMA_KEYS: [&str; 10] = [
    "type",
    "format",
    "items",
    "enum",
    "default",
    "minimum",
    "maximum",
    "minLength",
    "maxLength",
    "pattern",
];

const HTTP_METHODS: [&str; 7] = ["get", "put", "post", "delete", "options", "head", "patch"];

fn rewrite_refs(value: &Value) -> Value {
    match value {
        Value::Array(a) => Value::Array(a.iter().map(rewrite_refs).collect()),
        Value::Object(m) => {
            let mut out = Json::new();
            for (k, child) in m {
                match (k.as_str(), child) {
                    ("$ref", Value::String(s)) => {
                        let s = ["definitions", "parameters", "responses"]
                            .iter()
                            .zip(["schemas", "parameters", "responses"])
                            .find_map(|(old, new)| {
                                s.strip_prefix(&format!("#/{old}/"))
                                    .map(|rest| format!("#/components/{new}/{rest}"))
                            })
                            .unwrap_or_else(|| s.clone());
                        out.insert(k.clone(), Value::String(s));
                    }
                    _ => {
                        out.insert(k.clone(), rewrite_refs(child));
                    }
                }
            }
            Value::Object(out)
        }
        other => other.clone(),
    }
}

fn has_ref(p: &Json) -> bool {
    p.get("$ref").is_some_and(Value::is_string)
}

fn upgrade_parameter(param: &Json) -> Json {
    if has_ref(param) {
        return param.clone();
    }
    let mut schema = Json::new();
    let mut out = Json::new();
    for (k, v) in param {
        if PARAM_SCHEMA_KEYS.contains(&k.as_str()) {
            schema.insert(k.clone(), v.clone());
        } else if k != "collectionFormat" && k != "allowEmptyValue" {
            out.insert(k.clone(), v.clone());
        }
    }
    if !schema.is_empty() {
        out.insert("schema".into(), Value::Object(schema));
    }
    out
}

fn upgrade_response(response: &Json, produces: &[String]) -> Json {
    if has_ref(response) {
        return response.clone();
    }
    let mut rest = response.clone();
    rest.shift_remove("examples");
    // JS destructuring drops `schema` from `rest` whatever it holds.
    let schema = rest.shift_remove("schema");
    // `if (!schema)`: JS falsiness.
    let Some(schema) = schema.filter(crate::jsval::truthy) else {
        return rest;
    };
    let default = ["application/json".to_owned()];
    let types: &[String] = if produces.is_empty() {
        &default
    } else {
        produces
    };
    let mut content = Json::new();
    for t in types {
        content.insert(t.clone(), json!({ "schema": schema }));
    }
    rest.insert("content".into(), Value::Object(content));
    rest
}

fn str_list(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array)
        .map(|a| {
            a.iter()
                .filter_map(|x| x.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default()
}

fn param_key(p: &Json) -> String {
    match p.get("$ref") {
        Some(Value::String(s)) => s.clone(),
        _ => format!(
            "{}:{}",
            crate::jsval::js_string(p.get("in")),
            crate::jsval::js_string(p.get("name"))
        ),
    }
}

fn upgrade_operation(
    op: &Json,
    path_params: &[Json],
    consumes: &[String],
    produces: &[String],
) -> Json {
    let mut rest = op.clone();
    let parameters = rest.shift_remove("parameters");
    let responses = rest.shift_remove("responses");
    let op_consumes = rest.shift_remove("consumes");
    let op_produces = rest.shift_remove("produces");
    let op_params: Vec<Json> = parameters
        .as_ref()
        .and_then(Value::as_array)
        .map(|a| a.iter().filter_map(|p| p.as_object().cloned()).collect())
        .unwrap_or_default();

    let mut merged: indexmap::IndexMap<String, Json> = indexmap::IndexMap::new();
    for p in path_params.iter().chain(op_params.iter()) {
        merged.insert(param_key(p), p.clone());
    }
    let all: Vec<&Json> = merged.values().collect();
    let location = |p: &Json| p.get("in").and_then(Value::as_str).map(str::to_owned);

    let mut out = rest;
    let regular: Vec<Value> = all
        .iter()
        .filter(|p| !matches!(location(p).as_deref(), Some("body" | "formData")))
        .map(|p| Value::Object(upgrade_parameter(p)))
        .collect();
    if !regular.is_empty() {
        out.insert("parameters".into(), Value::Array(regular));
    }

    let body = all.iter().find(|p| location(p).as_deref() == Some("body"));
    let form: Vec<&&Json> = all
        .iter()
        .filter(|p| location(p).as_deref() == Some("formData"))
        .collect();
    let op_types = if op_consumes.as_ref().is_some_and(Value::is_array) {
        str_list(op_consumes.as_ref())
    } else {
        consumes.to_vec()
    };
    if let Some(body) = body {
        let json_types: Vec<&String> = op_types.iter().filter(|t| t.contains("json")).collect();
        let fallback = "application/json".to_owned();
        let types: Vec<&String> = if json_types.is_empty() {
            vec![&fallback]
        } else {
            json_types
        };
        let mut content = Json::new();
        for t in types {
            // `{ schema: body.schema }`: an absent schema is `undefined`, which JSON drops.
            let mut media = Json::new();
            if let Some(s) = body.get("schema") {
                media.insert("schema".into(), s.clone());
            }
            content.insert(t.clone(), Value::Object(media));
        }
        let mut rb = Json::new();
        if crate::jsval::truthy_opt(body.get("description")) {
            rb.insert("description".into(), body["description"].clone());
        }
        rb.insert(
            "required".into(),
            Value::Bool(body.get("required") == Some(&Value::Bool(true))),
        );
        rb.insert("content".into(), Value::Object(content));
        out.insert("requestBody".into(), Value::Object(rb));
    } else if !form.is_empty() {
        let mut properties = Json::new();
        let mut required: Vec<Value> = vec![];
        for p in &form {
            let mut prop = upgrade_parameter(p)
                .get("schema")
                .and_then(Value::as_object)
                .cloned()
                .unwrap_or_default();
            // `{ ...schema, description: p.description }`: overrides in place, drops undefined.
            match p.get("description") {
                Some(d) => {
                    prop.insert("description".into(), d.clone());
                }
                None => {
                    prop.shift_remove("description");
                }
            }
            let name = crate::jsval::js_string(p.get("name"));
            properties.insert(name.clone(), Value::Object(prop));
            if p.get("required") == Some(&Value::Bool(true)) {
                required.push(Value::String(name));
            }
        }
        let ty = if form
            .iter()
            .any(|p| p.get("type").and_then(Value::as_str) == Some("file"))
        {
            "multipart/form-data"
        } else {
            "application/x-www-form-urlencoded"
        };
        out.insert(
            "requestBody".into(),
            json!({ "content": { ty: { "schema": {
                "type": "object", "properties": properties, "required": required
            } } } }),
        );
    }

    if let Some(Value::Object(responses)) = responses {
        let op_prod = if op_produces.as_ref().is_some_and(Value::is_array) {
            str_list(op_produces.as_ref())
        } else {
            produces.to_vec()
        };
        let mut upgraded = Json::new();
        for (code, resp) in &responses {
            let v = match resp {
                Value::Object(r) => Value::Object(upgrade_response(r, &op_prod)),
                other => other.clone(),
            };
            upgraded.insert(code.clone(), v);
        }
        out.insert("responses".into(), Value::Object(upgraded));
    }
    out
}

fn upgrade_security_scheme(scheme: &Json) -> Json {
    let ty = scheme.get("type").and_then(Value::as_str);
    if ty == Some("basic") {
        return json!({ "type": "http", "scheme": "basic" })
            .as_object()
            .cloned()
            .unwrap_or_default();
    }
    if ty != Some("oauth2") {
        return scheme.clone();
    }
    let mut rest = scheme.clone();
    let flow = rest.shift_remove("flow");
    let authorization_url = rest.shift_remove("authorizationUrl");
    let token_url = rest.shift_remove("tokenUrl");
    let scopes = rest.shift_remove("scopes").unwrap_or_else(|| json!({}));
    let flow_name = match flow.as_ref().and_then(Value::as_str) {
        Some("application") => "clientCredentials".to_owned(),
        Some("accessCode") => "authorizationCode".to_owned(),
        _ => crate::jsval::js_string(flow.as_ref()),
    };
    let mut f = Json::new();
    // `undefined` urls vanish from the JSON.
    if let Some(u) = authorization_url {
        f.insert("authorizationUrl".into(), u);
    }
    if let Some(u) = token_url {
        f.insert("tokenUrl".into(), u);
    }
    f.insert("scopes".into(), scopes);
    let mut flows = Json::new();
    flows.insert(flow_name, Value::Object(f));
    // `{...rest, type: "oauth2", flows}`: `type` keeps its original slot.
    rest.insert("type".into(), Value::String("oauth2".into()));
    rest.insert("flows".into(), Value::Object(flows));
    rest
}

/// A Swagger 2.0 document (`swagger: "2.x"`).
pub fn is_swagger2(doc: &Value) -> bool {
    doc.get("swagger")
        .and_then(Value::as_str)
        .is_some_and(|s| s.starts_with("2."))
}

/// Converts a Swagger 2.0 document to the OpenAPI 3 shape the generator reads.
pub fn upgrade_swagger2(input: &Json) -> Json {
    let Value::Object(mut rest) = rewrite_refs(&Value::Object(input.clone())) else {
        unreachable!("rewrite_refs keeps objects")
    };
    let mut take = |k: &str| rest.shift_remove(k);
    let host = take("host");
    let base_path = take("basePath");
    let schemes = take("schemes");
    let consumes = take("consumes");
    let produces = take("produces");
    let definitions = take("definitions");
    let parameters = take("parameters");
    let responses = take("responses");
    let security_definitions = take("securityDefinitions");
    let paths = take("paths");
    take("swagger");

    let mut out = rest;
    out.insert("openapi".into(), Value::String("3.0.3".into()));

    if let Some(Value::String(host)) = &host {
        let list = str_list(schemes.as_ref());
        let scheme = if list.iter().any(|s| s == "https") {
            "https".to_owned()
        } else {
            list.first().cloned().unwrap_or_else(|| "https".into())
        };
        let bp = base_path.as_ref().and_then(Value::as_str).unwrap_or("");
        out.insert(
            "servers".into(),
            json!([{ "url": format!("{scheme}://{host}{bp}") }]),
        );
    } else if let Some(Value::String(bp)) = &base_path {
        out.insert("servers".into(), json!([{ "url": bp }]));
    }

    let mut components = Json::new();
    if let Some(d @ Value::Object(_)) = definitions {
        components.insert("schemas".into(), d);
    }
    if let Some(Value::Object(ps)) = &parameters {
        let mut params = Json::new();
        for (name, p) in ps {
            if let Value::Object(p) = p {
                params.insert(name.clone(), Value::Object(upgrade_parameter(p)));
            }
        }
        components.insert("parameters".into(), Value::Object(params));
    }
    if let Some(Value::Object(rs)) = &responses {
        let mut resps = Json::new();
        let json_only = ["application/json".to_owned()];
        for (name, r) in rs {
            if let Value::Object(r) = r {
                resps.insert(name.clone(), Value::Object(upgrade_response(r, &json_only)));
            }
        }
        components.insert("responses".into(), Value::Object(resps));
    }
    if let Some(Value::Object(sd)) = &security_definitions {
        let mut schemes_out = Json::new();
        for (name, s) in sd {
            if let Value::Object(s) = s {
                schemes_out.insert(name.clone(), Value::Object(upgrade_security_scheme(s)));
            }
        }
        components.insert("securitySchemes".into(), Value::Object(schemes_out));
    }
    if !components.is_empty() {
        out.insert("components".into(), Value::Object(components));
    }

    let doc_consumes = if consumes.as_ref().is_some_and(Value::is_array) {
        str_list(consumes.as_ref())
    } else {
        vec![]
    };
    let doc_produces = if produces.as_ref().is_some_and(Value::is_array) {
        str_list(produces.as_ref())
    } else {
        vec![]
    };
    let mut paths_out = Json::new();
    if let Some(Value::Object(paths)) = &paths {
        for (path, item) in paths {
            let Value::Object(item) = item else { continue };
            let path_params: Vec<Json> = item
                .get("parameters")
                .and_then(Value::as_array)
                .map(|a| a.iter().filter_map(|p| p.as_object().cloned()).collect())
                .unwrap_or_default();
            let mut item_out = Json::new();
            for (k, v) in item {
                if k == "parameters" {
                    continue;
                }
                let upgraded = match v {
                    Value::Object(op) if HTTP_METHODS.contains(&k.as_str()) => Value::Object(
                        upgrade_operation(op, &path_params, &doc_consumes, &doc_produces),
                    ),
                    other => other.clone(),
                };
                item_out.insert(k.clone(), upgraded);
            }
            paths_out.insert(path.clone(), Value::Object(item_out));
        }
    }
    out.insert("paths".into(), Value::Object(paths_out));
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn up(v: Value) -> Value {
        Value::Object(upgrade_swagger2(v.as_object().unwrap()))
    }

    #[test]
    fn host_schemes_and_refs_become_servers_and_components() {
        let out = up(json!({
            "swagger": "2.0", "host": "h", "basePath": "/b", "schemes": ["http", "https"],
            "definitions": { "A": {} },
            "paths": { "/x": { "get": { "parameters": [{ "$ref": "#/parameters/p" }],
                "responses": { "200": { "schema": { "$ref": "#/definitions/A" } } } } } }
        }));
        assert_eq!(out["openapi"], "3.0.3");
        assert_eq!(out["servers"][0]["url"], "https://h/b");
        assert_eq!(out["components"]["schemas"]["A"], json!({}));
        let get = &out["paths"]["/x"]["get"];
        assert_eq!(get["parameters"][0]["$ref"], "#/components/parameters/p");
        assert_eq!(
            get["responses"]["200"]["content"]["application/json"]["schema"]["$ref"],
            "#/components/schemas/A"
        );
    }

    #[test]
    fn body_and_form_parameters_become_request_bodies() {
        let out = up(json!({
            "swagger": "2.0", "consumes": ["application/xml", "application/json"],
            "paths": { "/x": {
                "post": { "parameters": [{ "in": "body", "name": "b", "required": true, "schema": { "type": "string" } }] },
                "put": { "parameters": [{ "in": "formData", "name": "f", "type": "file", "required": true }] }
            } }
        }));
        let post = &out["paths"]["/x"]["post"]["requestBody"];
        assert_eq!(post["required"], true);
        assert_eq!(
            post["content"]["application/json"]["schema"]["type"],
            "string"
        );
        let put =
            &out["paths"]["/x"]["put"]["requestBody"]["content"]["multipart/form-data"]["schema"];
        assert_eq!(put["required"], json!(["f"]));
        assert_eq!(put["properties"]["f"]["type"], "file");
        assert!(out.get("servers").is_none());
    }

    #[test]
    fn security_definitions_map_flows() {
        let out = up(json!({
            "swagger": "2.0", "basePath": "/api",
            "securityDefinitions": {
                "b": { "type": "basic" },
                "o": { "type": "oauth2", "flow": "application", "tokenUrl": "t" },
                "k": { "type": "apiKey", "name": "n", "in": "header" }
            }
        }));
        assert_eq!(out["servers"][0]["url"], "/api");
        let s = &out["components"]["securitySchemes"];
        assert_eq!(s["b"], json!({ "type": "http", "scheme": "basic" }));
        assert_eq!(
            s["o"]["flows"]["clientCredentials"],
            json!({ "tokenUrl": "t", "scopes": {} })
        );
        assert_eq!(s["k"]["name"], "n");
        assert!(is_swagger2(&json!({ "swagger": "2.0" })));
        assert!(!is_swagger2(&json!({ "openapi": "3.0.0" })));
    }
}
