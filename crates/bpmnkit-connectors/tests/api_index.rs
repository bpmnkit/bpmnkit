//! API-index generator: parity with `scripts/api-index-ops.mjs` (fixtures recorded by
//! `scripts/record-api-index-fixtures.mjs`), unit tests of the Rust-only fields, and the facts
//! reaching `bpmnkit_jobspec::ApiIndex`.

use bpmnkit_connectors::{api_service, AuthHint};
use bpmnkit_jobspec::ApiIndex;
use serde_json::{json, Value};
use std::fs;
use std::path::Path;

const RUST_ONLY: [&str; 7] = [
    "auth",
    "requestMediaTypes",
    "responseMediaTypes",
    "responseKeys",
    "responseList",
    "linkHeader",
    "x-bpmnkit-paginate",
];

fn svc(spec: &str) -> Value {
    api_service(spec, "svc", "Svc", AuthHint::NoAuth).unwrap()
}

fn op<'a>(service: &'a Value, method: &str, path: &str) -> &'a Value {
    service["operations"]
        .as_array()
        .unwrap()
        .iter()
        .find(|o| o["method"] == method && o["path"] == path)
        .unwrap_or_else(|| panic!("{method} {path}"))
}

#[test]
fn matches_the_ts_index_apart_from_the_rust_only_fields() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures");
    let mut checked = 0;
    for entry in fs::read_dir(root.join("api-index")).unwrap() {
        let path = entry.unwrap().path();
        let name = path.file_name().unwrap().to_string_lossy().into_owned();
        let spec_name = name.strip_suffix(".json").unwrap();
        let expected: Value = serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
        let spec = fs::read_to_string(root.join("specs").join(spec_name)).unwrap();
        let mut got = api_service(
            &spec,
            expected["id"].as_str().unwrap(),
            expected["name"].as_str().unwrap(),
            AuthHint::NoAuth,
        )
        .unwrap_or_else(|e| panic!("{spec_name}: {e}"));
        for o in got["operations"].as_array_mut().unwrap() {
            let o = o.as_object_mut().unwrap();
            RUST_ONLY.iter().for_each(|k| {
                o.remove(*k);
            });
            // TS keeps the operation id only where there is no summary
            if o.contains_key("summary") {
                o.remove("id");
            }
        }
        assert_eq!(got, expected, "{spec_name}");
        checked += 1;
    }
    assert!(checked >= 10, "fixtures missing: {checked}");
}

#[test]
fn unparsable_text_is_an_error() {
    assert!(api_service("{", "x", "x", AuthHint::NoAuth).is_err());
    assert!(api_service("[1]", "x", "x", AuthHint::NoAuth).is_err());
}

#[test]
fn operation_id_is_kept_next_to_a_summary() {
    let s = svc(
        r#"{"openapi":"3.0.0","paths":{"/a":{"get":{"summary":"List things","operationId":"listThings"}}}}"#,
    );
    assert_eq!(op(&s, "GET", "/a")["summary"], "List things");
    assert_eq!(op(&s, "GET", "/a")["id"], "listThings");
}

#[test]
fn openapi3_media_types_keys_and_defaults() {
    let s = svc(r##"{"openapi":"3.0.0","components":{"schemas":{
          "Page":{"allOf":[{"properties":{"next":{}}},{"properties":{"items":{},"total":{}}}]}}},
        "paths":{"/plain":{"get":{"operationId":"plain","responses":{"200":{"description":"x"}}}},
          "/p":{"post":{"operationId":"p",
            "requestBody":{"content":{"application/json":{"schema":{}},"application/xml":{"schema":{}}}},
            "responses":{"201":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/Page"}}}},
                         "default":{"content":{"text/plain":{}}}}}}}}"##);
    let plain = op(&s, "GET", "/plain");
    for k in RUST_ONLY {
        assert!(plain.get(k).is_none(), "{k} is omitted when default");
    }
    let p = op(&s, "POST", "/p");
    assert_eq!(
        p["requestMediaTypes"],
        json!(["application/json", "application/xml"])
    );
    assert_eq!(
        p["responseMediaTypes"],
        json!(["application/json", "text/plain"])
    );
    assert_eq!(p["responseKeys"], json!(["items", "next", "total"]));
    assert!(p.get("responseList").is_none());
}

#[test]
fn array_response_is_a_list() {
    let s = svc(
        r#"{"openapi":"3.0.0","paths":{"/l":{"get":{"responses":{"200":{"content":{
          "application/json":{"schema":{"type":"array","items":{"type":"object"}}}}}}}}}}"#,
    );
    let l = op(&s, "GET", "/l");
    assert_eq!(l["responseList"], true);
    assert!(l.get("responseKeys").is_none());
}

#[test]
fn link_header_and_paginate_extension() {
    let s = svc(r#"{"openapi":"3.0.0","paths":{
          "/linked":{"get":{"responses":{"200":{"description":"x","headers":{"LINK":{"schema":{"type":"string"}}}}}}},
          "/ext":{"get":{"x-bpmnkit-paginate":true,"responses":{"200":{"description":"x"}}}},
          "/not":{"get":{"x-bpmnkit-paginate":false,"responses":{"404":{"description":"x","headers":{"Link":{}}}}}}}}"#);
    assert_eq!(op(&s, "GET", "/linked")["linkHeader"], true);
    assert_eq!(op(&s, "GET", "/ext")["x-bpmnkit-paginate"], true);
    let not = op(&s, "GET", "/not");
    assert!(not.get("linkHeader").is_none() && not.get("x-bpmnkit-paginate").is_none());
}

const AUTH_SPEC: &str = r#"{"openapi":"3.0.0","components":{"securitySchemes":{
    "tok":{"type":"http","scheme":"bearer"},
    "basic":{"type":"http","scheme":"basic"},
    "aws":{"type":"apiKey","in":"header","name":"Authorization","x-amazon-apigateway-authtype":"awsSigv4"},
    "mac":{"type":"http","scheme":"HMAC"}}},
  "paths":{
    "/same":{"get":{"security":[{"tok":[]}]}},
    "/basic":{"get":{"security":[{"basic":[]}]}},
    "/open":{"get":{"security":[]}},
    "/mac":{"get":{"security":[{"mac":[]}]}},
    "/none":{"get":{}}}}"#;

#[test]
fn per_operation_auth_differs_from_the_service() {
    let s = svc(AUTH_SPEC);
    assert_eq!(s["auth"], json!({"type": "bearer"}));
    assert!(op(&s, "GET", "/same").get("auth").is_none());
    assert!(op(&s, "GET", "/none").get("auth").is_none());
    assert_eq!(op(&s, "GET", "/basic")["auth"], json!({"type": "basic"}));
    assert_eq!(op(&s, "GET", "/open")["auth"], json!({"type": "noAuth"}));
    assert_eq!(op(&s, "GET", "/mac")["auth"], json!({"type": "hmac"}));
}

#[test]
fn sigv4_scheme_is_named_not_a_bearer() {
    let s = svc(r#"{"openapi":"3.0.0","components":{"securitySchemes":{
          "tok":{"type":"http","scheme":"bearer"},
          "aws":{"type":"apiKey","in":"header","name":"Authorization","x-amazon-apigateway-authtype":"awsSigv4"},
          "k":{"type":"apiKey","in":"query","name":"key"}}},
          "paths":{"/a":{"get":{"security":[{"aws":[]}]}},"/b":{"get":{"security":[{"k":[]}]}}}}"#);
    assert_eq!(s["auth"], json!({"type": "bearer"}));
    assert_eq!(op(&s, "GET", "/a")["auth"], json!({"type": "sigv4"}));
    assert_eq!(
        op(&s, "GET", "/b")["auth"],
        json!({"type": "apiKey", "in": "query", "name": "key"})
    );
}

#[test]
fn swagger2_uses_consumes_and_produces() {
    let s = svc(
        r#"{"swagger":"2.0","host":"api.acme.io","consumes":["application/json"],"produces":["application/json"],
          "paths":{"/a":{"get":{"responses":{"200":{"description":"x"}}},
            "post":{"parameters":[{"in":"body","name":"b","schema":{"properties":{"k":{}}}}],
                    "produces":["text/csv"],"responses":{"200":{"schema":{"properties":{"z":{},"a":{}}}}}}}}}"#,
    );
    let get = op(&s, "GET", "/a");
    assert!(get.get("requestMediaTypes").is_none());
    assert_eq!(get["responseMediaTypes"], json!(["application/json"]));
    let post = op(&s, "POST", "/a");
    assert_eq!(post["requestMediaTypes"], json!(["application/json"]));
    assert_eq!(post["responseMediaTypes"], json!(["text/csv"]));
    assert_eq!(post["responseKeys"], json!(["a", "z"]));
}

#[test]
fn rust_output_feeds_jobspec() {
    let spec = r##"{"openapi":"3.0.0","servers":[{"url":"https://api.acme.io"}],
        "components":{"securitySchemes":{"tok":{"type":"http","scheme":"bearer"},
          "basic":{"type":"http","scheme":"basic"}}},
        "paths":{"/items":{"get":{"summary":"List items","operationId":"listItems",
            "security":[{"basic":[]}],"x-bpmnkit-paginate":true,
            "parameters":[{"in":"header","name":"X-Tenant","required":true}],
            "responses":{"200":{"headers":{"Link":{}},"content":{"application/json":{
              "schema":{"properties":{"next":{},"data":{}}}}}}}}}}}"##;
    let service = api_service(spec, "acme", "Acme", AuthHint::NoAuth).unwrap();
    let mut index = ApiIndex::default();
    index.add_json(&service.to_string()).unwrap();
    for reference in ["acme#listItems", "acme#get /items"] {
        let bound = index
            .get(reference)
            .unwrap_or_else(|| panic!("{reference}"));
        assert_eq!(bound.auth, "basic");
        assert_eq!(bound.response_media_types, ["application/json"]);
        assert_eq!(bound.response_keys, ["data", "next"]);
        assert!(bound.paginate && bound.link_header && !bound.response_list);
        assert_eq!(bound.required_headers, ["X-Tenant"]);
    }
}
