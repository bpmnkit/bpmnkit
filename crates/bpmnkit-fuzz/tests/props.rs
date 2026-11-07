//! Rust-only properties over the fuzz generators: no panics, serializers are idempotent, process
//! text always expands, and the generators mostly produce input that parses (else the
//! differential run would only compare two parse errors). `PROPTEST_CASES` raises the count.

use bpmnkit_fuzz::{gen, run, Target};
use proptest::prelude::*;
use proptest::test_runner::{Config, RngAlgorithm, TestRng, TestRunner};
use serde_json::Value as Json;

fn config() -> ProptestConfig {
    ProptestConfig {
        cases: std::env::var("PROPTEST_CASES")
            .ok()
            .and_then(|c| c.parse().ok())
            .unwrap_or(64),
        failure_persistence: None,
        ..ProptestConfig::default()
    }
}

/// `run` again on its own output: a second parse/serialize changes nothing.
fn idempotent(
    target: Target,
    field: &str,
    out_key: &str,
    first: &Json,
) -> Result<(), TestCaseError> {
    let Some(text) = first.get(out_key).and_then(Json::as_str) else {
        return Ok(());
    };
    let second = run(target, &serde_json::json!({ field: text }));
    prop_assert_eq!(second.get(out_key), first.get(out_key));
    Ok(())
}

proptest! {
    #![proptest_config(config())]

    #[test]
    fn feel_never_panics(req in gen::strategy(Target::Feel)) {
        prop_assert!(run(Target::Feel, &req).get("panic").is_none());
    }

    #[test]
    fn bpmn_roundtrip_is_stable(req in gen::strategy(Target::Bpmn)) {
        let out = run(Target::Bpmn, &req);
        prop_assert!(out.get("panic").is_none(), "{}", out);
        idempotent(Target::Bpmn, "xml", "xml", &out)?;
    }

    #[test]
    fn dmn_roundtrip_is_stable(req in gen::strategy(Target::Dmn)) {
        let out = run(Target::Dmn, &req);
        prop_assert!(out.get("panic").is_none(), "{}", out);
        idempotent(Target::Dmn, "xml", "xml", &out)?;
    }

    #[test]
    fn dmn_eval_never_panics(req in gen::strategy(Target::DmnEval)) {
        prop_assert!(run(Target::DmnEval, &req).get("panic").is_none());
    }

    #[test]
    fn form_roundtrip_is_stable(req in gen::strategy(Target::Form)) {
        let out = run(Target::Form, &req);
        prop_assert!(out.get("panic").is_none(), "{}", out);
        idempotent(Target::Form, "json", "text", &out)?;
    }

    #[test]
    fn process_text_always_expands(req in gen::strategy(Target::Text)) {
        let out = run(Target::Text, &req);
        prop_assert!(out.get("panic").is_none(), "{}", out);
        prop_assert!(out.get("expandError").is_none(), "{}", out);
    }

    #[test]
    fn compact_never_panics(req in gen::strategy(Target::Compact)) {
        let out = run(Target::Compact, &req);
        prop_assert!(out.get("panic").is_none(), "{}", out);
        prop_assert!(out.get("error").is_none(), "{}", out);
    }
}

#[test]
fn generators_mostly_parse() {
    for (target, ok_key) in [
        (Target::Bpmn, "model"),
        (Target::Dmn, "model"),
        (Target::Form, "model"),
        (Target::Compact, "expanded"),
    ] {
        let mut runner = TestRunner::new_with_rng(
            Config::default(),
            TestRng::from_seed(RngAlgorithm::ChaCha, &[7; 32]),
        );
        let strategy = gen::strategy(target);
        let total = 200;
        let ok = (0..total)
            .filter(|_| {
                let req = strategy.new_tree(&mut runner).expect("generate").current();
                run(target, &req).get(ok_key).is_some()
            })
            .count();
        assert!(
            ok * 10 >= total * 7,
            "{}: only {ok} of {total} inputs reach {ok_key}",
            target.name()
        );
    }
}
