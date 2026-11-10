//! Built-in functions. Signatures and arity come from `spec/feel-builtins.json`
//! through `bpmnkit-spec`; implementations port `packages/feel/src/builtins.ts`.

mod boolean;
mod context;
mod conversion;
mod list;
mod numeric;
mod range;
pub(crate) mod string;
mod temporal;

use crate::value::{Function, Value};
use bpmnkit_spec::feel::{feel_builtin, FeelBuiltinGroup};

/// A built-in's implementation. A missing argument is absent from the slice.
pub type BuiltinFn = fn(&[Value]) -> Value;

fn implementation(name: &str) -> Option<BuiltinFn> {
    let builtin = feel_builtin(name)?;
    match builtin.group {
        FeelBuiltinGroup::Conversion => conversion::lookup(name),
        FeelBuiltinGroup::Boolean => boolean::lookup(name),
        FeelBuiltinGroup::String => string::lookup(name),
        FeelBuiltinGroup::List => list::lookup(name),
        FeelBuiltinGroup::Numeric => numeric::lookup(name),
        FeelBuiltinGroup::Context => context::lookup(name),
        FeelBuiltinGroup::Temporal => temporal::lookup(name),
        FeelBuiltinGroup::Range => range::lookup(name),
    }
}

/// Calls built-in `name` positionally. `None` when there is no such built-in;
/// `Some(Null)` when no signature accepts this many arguments (FEEL's error).
pub fn call(name: &str, args: &[Value]) -> Option<Value> {
    let builtin = feel_builtin(name)?;
    let f = implementation(name)?;
    Some(if builtin.accepts_arity(args.len()) {
        f(args)
    } else {
        Value::Null
    })
}

/// For a named invocation, the argument index that supplies each parameter.
pub fn order_named_args(name: &str, arg_names: &[&str]) -> Option<Vec<usize>> {
    feel_builtin(name)?.order_named_args(arg_names)
}

pub fn exists(name: &str) -> bool {
    implementation(name).is_some()
}

/// The built-in as a function value (`sort(xs, <)`-style references, `f := count`).
pub fn as_function(name: &'static str) -> Option<Function> {
    exists(name).then(|| Function::new(None, move |args| call(name, args).unwrap_or(Value::Null)))
}
