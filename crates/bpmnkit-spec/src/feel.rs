//! FEEL built-in signatures (`spec/feel-builtins.json`).

pub use crate::generated::feel_builtins::FEEL_BUILTINS;

/// The section of the FEEL spec a built-in belongs to.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum FeelBuiltinGroup {
    Conversion,
    Boolean,
    String,
    List,
    Numeric,
    Context,
    Temporal,
    Range,
}

/// One built-in: its name and the parameter names of each signature.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct FeelBuiltin {
    pub name: &'static str,
    pub group: FeelBuiltinGroup,
    /// Parameter names in declaration order, one list per signature.
    pub signatures: &'static [&'static [&'static str]],
    /// Also defined over a bare argument list (`max(1, 2, 3)`); arity is not checked.
    pub variadic: bool,
}

impl FeelBuiltin {
    /// Whether a call with `count` arguments matches a signature.
    pub fn accepts_arity(&self, count: usize) -> bool {
        self.variadic || self.signatures.iter().any(|s| s.len() == count)
    }

    /// For a named invocation, the index into `arg_names` that supplies each
    /// parameter of the first signature with exactly these names; `None` when
    /// no signature matches.
    pub fn order_named_args(&self, arg_names: &[&str]) -> Option<Vec<usize>> {
        self.signatures
            .iter()
            .filter(|params| params.len() == arg_names.len())
            .find_map(|params| {
                params
                    .iter()
                    .map(|p| arg_names.iter().position(|a| a == p))
                    .collect()
            })
    }
}

/// The built-in called `name`, if FEEL has one.
pub fn feel_builtin(name: &str) -> Option<&'static FeelBuiltin> {
    FEEL_BUILTINS.iter().find(|b| b.name == name)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::spec_json;

    #[test]
    fn generated_table_matches_spec_file() {
        let spec = spec_json("feel-builtins.json");
        let entries = spec["builtins"].as_array().expect("builtins");
        assert_eq!(entries.len(), FEEL_BUILTINS.len());
        for (json, b) in entries.iter().zip(FEEL_BUILTINS) {
            assert_eq!(json["name"], b.name);
            assert_eq!(
                json["group"].as_str().map(str::to_owned),
                Some(format!("{:?}", b.group).to_lowercase())
            );
            let sigs: Vec<Vec<&str>> = json["signatures"]
                .as_array()
                .expect("signatures")
                .iter()
                .map(|s| {
                    s.as_array()
                        .expect("signature")
                        .iter()
                        .map(|p| p.as_str().expect("param"))
                        .collect()
                })
                .collect();
            let generated: Vec<Vec<&str>> = b.signatures.iter().map(|s| s.to_vec()).collect();
            assert_eq!(sigs, generated, "{}", b.name);
            assert_eq!(json["variadic"].as_bool().unwrap_or(false), b.variadic);
        }
    }

    #[test]
    fn names_are_unique() {
        let mut names: Vec<_> = FEEL_BUILTINS.iter().map(|b| b.name).collect();
        names.sort_unstable();
        names.dedup();
        assert_eq!(names.len(), FEEL_BUILTINS.len());
    }

    #[test]
    fn arity_and_named_arguments() {
        let substring = feel_builtin("substring").expect("substring");
        assert!(substring.accepts_arity(2) && substring.accepts_arity(3));
        assert!(!substring.accepts_arity(1));
        assert_eq!(
            substring.order_named_args(&["start position", "string"]),
            Some(vec![1, 0])
        );
        assert_eq!(substring.order_named_args(&["string", "length"]), None);
        assert!(feel_builtin("max").expect("max").accepts_arity(5));
        assert!(feel_builtin("no such function").is_none());
    }
}
