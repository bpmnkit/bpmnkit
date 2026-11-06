//! Context built-ins, ported from the context section of `packages/feel/src/builtins.ts`.
//! Contexts are ordered, so entries keep the order they were inserted in.

use super::BuiltinFn;
use crate::value::{Context, Value};

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "get value" => get_value,
        "get entries" => get_entries,
        "context put" => context_put,
        "context merge" => context_merge,
        _ => return None,
    })
}

/// A key, or a list of keys that walks into nested contexts.
fn path_of(key: &Value) -> &[Value] {
    match key {
        Value::List(l) => l,
        k => std::slice::from_ref(k),
    }
}

fn get_value(args: &[Value]) -> Value {
    let Some(Value::Context(_)) = args.first() else {
        return Value::Null;
    };
    let mut current = args[0].clone();
    for step in path_of(args.get(1).unwrap_or(&Value::Null)) {
        let (Value::String(name), Value::Context(c)) = (step, &current) else {
            return Value::Null;
        };
        let Some(next) = c.get(name) else {
            return Value::Null;
        };
        current = next.clone();
    }
    current
}

fn get_entries(args: &[Value]) -> Value {
    let Some(Value::Context(ctx)) = args.first() else {
        return Value::Null;
    };
    Value::List(
        ctx.iter()
            .map(|(k, v)| {
                let mut entry = Context::new();
                entry.insert("key", k.as_str());
                entry.insert("value", v.clone());
                Value::Context(entry)
            })
            .collect(),
    )
}

/// Copies a context with `path` set to `value`, creating contexts on the way.
fn put_path(ctx: &Context, path: &[Value], value: &Value) -> Option<Context> {
    let Some(Value::String(name)) = path.first() else {
        return None;
    };
    let mut result = ctx.clone();
    if path.len() == 1 {
        result.insert(name.as_str(), value.clone());
        return Some(result);
    }
    let empty = Context::new();
    let nested = match result.get(name) {
        None => &empty,
        Some(Value::Context(c)) => c,
        // A step onto something that is not a context has nowhere to go.
        Some(_) => return None,
    };
    let inner = put_path(nested, &path[1..], value)?;
    result.insert(name.as_str(), Value::Context(inner));
    Some(result)
}

fn context_put(args: &[Value]) -> Value {
    let (Some(Value::Context(ctx)), Some(key), Some(value)) =
        (args.first(), args.get(1), args.get(2))
    else {
        return Value::Null;
    };
    let path = path_of(key);
    if path.is_empty() {
        return Value::Null;
    }
    put_path(ctx, path, value).map_or(Value::Null, Value::Context)
}

fn context_merge(args: &[Value]) -> Value {
    // The signature is one list of contexts; a bare argument list is accepted
    // too, the way the other list built-ins are.
    let contexts = match args {
        [Value::List(l)] => l,
        _ => args,
    };
    if contexts.is_empty() {
        return Value::Null;
    }
    let mut result = Context::new();
    for v in contexts {
        let Value::Context(c) = v else {
            return Value::Null;
        };
        for (k, cv) in c {
            result.insert(k.as_str(), cv.clone());
        }
    }
    Value::Context(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn ctx(entries: &[(&str, Value)]) -> Value {
        Value::Context(
            entries
                .iter()
                .map(|(k, v)| ((*k).to_owned(), v.clone()))
                .collect(),
        )
    }
    fn keys(v: &Value) -> Vec<String> {
        let Value::Context(c) = v else {
            panic!("not a context")
        };
        c.keys().cloned().collect()
    }

    #[test]
    fn get_value_plain_and_path() {
        let c = ctx(&[("a", 1.into()), ("y", ctx(&[("a", 5.into())]))]);
        assert_eq!(call("get value", &[c.clone(), "a".into()]), 1.into());
        assert_eq!(call("get value", &[c.clone(), "z".into()]), Value::Null);
        let path = Value::List(vec!["y".into(), "a".into()]);
        assert_eq!(call("get value", &[c.clone(), path]), 5.into());
        let bad = Value::List(vec!["a".into(), "q".into()]);
        assert_eq!(call("get value", &[c, bad]), Value::Null);
        assert_eq!(call("get value", &[1.into(), "a".into()]), Value::Null);
    }

    #[test]
    fn get_entries_keeps_key_order() {
        let c = ctx(&[("z", 1.into()), ("a", 2.into()), ("m", 3.into())]);
        let Value::List(entries) = call("get entries", &[c]) else {
            panic!("list")
        };
        let ks: Vec<_> = entries
            .iter()
            .map(|e| match e {
                Value::Context(c) => c.get("key").cloned().unwrap(),
                _ => panic!("entry"),
            })
            .collect();
        assert_eq!(ks, vec!["z".into(), "a".into(), "m".into()]);
        assert_eq!(keys(&entries[0]), vec!["key", "value"]);
        assert_eq!(call("get entries", &[1.into()]), Value::Null);
    }

    #[test]
    fn put_appends_replaces_and_nests() {
        let c = ctx(&[("b", 1.into()), ("a", 2.into())]);
        let put = call("context put", &[c.clone(), "c".into(), 3.into()]);
        assert_eq!(keys(&put), vec!["b", "a", "c"]);
        let replaced = call("context put", &[c.clone(), "b".into(), 9.into()]);
        assert_eq!(keys(&replaced), vec!["b", "a"]);
        assert_eq!(call("get value", &[replaced, "b".into()]), 9.into());

        let path = Value::List(vec!["x".into(), "y".into()]);
        let nested = call("context put", &[c.clone(), path.clone(), 7.into()]);
        assert_eq!(
            call(
                "get value",
                &[nested, Value::List(vec!["x".into(), "y".into()])]
            ),
            7.into()
        );
        // The step "b" is a number, not a context.
        let blocked = Value::List(vec!["b".into(), "y".into()]);
        assert_eq!(
            call("context put", &[c.clone(), blocked, 1.into()]),
            Value::Null
        );
        assert_eq!(
            call("context put", &[c.clone(), Value::List(vec![]), 1.into()]),
            Value::Null
        );
        assert_eq!(call("context put", &[c, "k".into()]), Value::Null);
    }

    #[test]
    fn merge_later_wins_in_place() {
        let m = call(
            "context merge",
            &[
                ctx(&[("b", 1.into())]),
                ctx(&[("a", 2.into()), ("b", 3.into())]),
            ],
        );
        assert_eq!(keys(&m), vec!["b", "a"]);
        assert_eq!(call("get value", &[m, "b".into()]), 3.into());
        let list = Value::List(vec![ctx(&[("a", 1.into())]), ctx(&[("c", 2.into())])]);
        assert_eq!(keys(&call("context merge", &[list])), vec!["a", "c"]);
        assert_eq!(call("context merge", &[]), Value::Null);
        assert_eq!(call("context merge", &[1.into()]), Value::Null);
    }
}
