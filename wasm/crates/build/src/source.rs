//! Source checks that run before rustc sees the code. They close the holes the generated
//! `Cargo.toml` cannot: reading host files at compile time (`include*!`, `#[path]`), build-env
//! leaks (`env!`), extra crates (`extern crate`) and loosened lints (crate attributes). This is a
//! guard against accidents and prompt-injected shortcuts, not a sandbox: the builder service
//! isolates rustc itself.

use bpmnkit_wasm_contract::Diagnostic;
use proc_macro2::{Delimiter, TokenStream, TokenTree};
use syn::visit::Visit;

/// Macros that read the build host, by any spelling of the path.
const INCLUDES: [&str; 3] = ["include", "include_str", "include_bytes"];
const ENV: [&str; 2] = ["env", "option_env"];

pub const MAX_FILE_BYTES: usize = 256 * 1024;
pub const MAX_TOTAL_BYTES: usize = 1024 * 1024;
pub const MAX_FILES: usize = 32;

fn diag(file: &str, at: proc_macro2::Span, code: &str, message: &str, hint: &str) -> Diagnostic {
    let s = at.start();
    Diagnostic {
        file: file.into(),
        line: s.line as u32,
        col: s.column as u32 + 1,
        code: code.into(),
        message: message.into(),
        suggestion: Some(hint.into()),
    }
}

struct Checker<'a> {
    file: &'a str,
    out: Vec<Diagnostic>,
}

impl Checker<'_> {
    fn forbidden_macro(&mut self, at: proc_macro2::Span, name: &str) {
        self.out.push(diag(
            self.file,
            at,
            "forbidden-macro",
            &format!("`{name}!` is not allowed: workers cannot read the build host"),
            "pass data in through job variables or the manifest instead",
        ));
    }

    fn name(&mut self, id: &proc_macro2::Ident, bang: bool) {
        let n = id.to_string();
        if INCLUDES.contains(&n.as_str()) || (bang && ENV.contains(&n.as_str())) {
            self.forbidden_macro(id.span(), &n);
        }
    }

    fn tokens(&mut self, ts: TokenStream) {
        let mut it = ts.into_iter().peekable();
        while let Some(tt) = it.next() {
            match tt {
                TokenTree::Ident(id) => {
                    let bang = matches!(it.peek(), Some(TokenTree::Punct(p)) if p.as_char() == '!');
                    self.name(&id, bang);
                    if id == "extern"
                        && matches!(it.peek(), Some(TokenTree::Ident(n)) if n == "crate")
                    {
                        self.extern_crate(id.span());
                    }
                }
                TokenTree::Punct(p) if p.as_char() == '#' => {
                    if matches!(it.peek(), Some(TokenTree::Punct(b)) if b.as_char() == '!') {
                        it.next();
                    }
                    if let Some(TokenTree::Group(g)) = it.peek() {
                        if g.delimiter() == Delimiter::Bracket {
                            let mut inner = g.stream().into_iter();
                            if matches!(inner.next(), Some(TokenTree::Ident(i)) if i == "path")
                                && matches!(inner.next(), Some(TokenTree::Punct(e)) if e.as_char() == '=')
                            {
                                self.path_attr(p.span());
                            }
                        }
                    }
                }
                TokenTree::Group(g) => self.tokens(g.stream()),
                _ => {}
            }
        }
    }

    fn extern_crate(&mut self, at: proc_macro2::Span) {
        self.out.push(diag(
            self.file,
            at,
            "extern-crate",
            "`extern crate` is not allowed: no crates can be added",
            "use the SDK prelude, serde and serde_json only",
        ));
    }

    fn path_attr(&mut self, at: proc_macro2::Span) {
        self.out.push(diag(
            self.file,
            at,
            "path-attribute",
            "`#[path]` is not allowed: modules must live next to their parent",
            "remove it and put the module at the default location",
        ));
    }
}

impl<'ast> Visit<'ast> for Checker<'_> {
    fn visit_item_extern_crate(&mut self, i: &'ast syn::ItemExternCrate) {
        self.extern_crate(i.extern_token.span);
    }

    fn visit_attribute(&mut self, a: &'ast syn::Attribute) {
        use syn::spanned::Spanned;
        if a.path().is_ident("path") {
            self.path_attr(a.span());
        } else if a.path().is_ident("cfg_attr") {
            if let syn::Meta::List(l) = &a.meta {
                // `#[cfg_attr(all(), path = "…")]` hides the attribute one level down.
                let mut prev_path = false;
                for tt in l.tokens.clone() {
                    match &tt {
                        TokenTree::Ident(i) if i == "path" => prev_path = true,
                        TokenTree::Punct(p) if p.as_char() == '=' && prev_path => {
                            self.path_attr(a.span());
                            break;
                        }
                        _ => prev_path = false,
                    }
                }
            }
        }
        syn::visit::visit_attribute(self, a);
    }

    fn visit_macro(&mut self, m: &'ast syn::Macro) {
        if let Some(last) = m.path.segments.last() {
            self.name(&last.ident, true);
        }
        self.tokens(m.tokens.clone());
    }

    fn visit_use_name(&mut self, u: &'ast syn::UseName) {
        self.name(&u.ident, true);
    }

    fn visit_use_rename(&mut self, u: &'ast syn::UseRename) {
        self.name(&u.ident, true);
    }
}

/// Checks one `src/**.rs` file. A file that does not parse yields one `parse` diagnostic.
pub fn check_source(file: &str, text: &str) -> Vec<Diagnostic> {
    let ast = match syn::parse_file(text) {
        Ok(a) => a,
        Err(e) => {
            let s = e.span().start();
            return vec![Diagnostic {
                file: file.into(),
                line: s.line as u32,
                col: s.column as u32 + 1,
                code: "parse".into(),
                message: e.to_string(),
                suggestion: None,
            }];
        }
    };
    let mut c = Checker {
        file,
        out: Vec::new(),
    };
    for a in &ast.attrs {
        if !a.path().is_ident("doc") {
            use syn::spanned::Spanned;
            c.out.push(diag(
                file,
                a.span(),
                "crate-attribute",
                "crate-level attributes are not allowed (they could loosen lints or features)",
                "remove the `#![…]` line",
            ));
        }
    }
    c.visit_file(&ast);
    c.out.sort_by_key(|a| (a.line, a.col));
    c.out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn codes(src: &str) -> Vec<String> {
        check_source("src/lib.rs", src)
            .into_iter()
            .map(|d| d.code)
            .collect()
    }

    #[test]
    fn clean_source_passes() {
        let src = r#"
            //! doc
            use bpmnkit_wasm_sdk::prelude::*;
            #[derive(Debug)] struct W;
            fn f(env: &str) -> String { format!("{env} {}", 1) }
            mod inner { pub fn g() {} }
        "#;
        assert_eq!(codes(src), Vec::<String>::new());
    }

    #[test]
    fn negative_fixtures() {
        let cases: &[(&str, &str)] = &[
            (
                r#"const X: &[u8] = include_bytes!("/etc/passwd");"#,
                "forbidden-macro",
            ),
            (
                r#"const X: &str = std::include_str!("/etc/passwd");"#,
                "forbidden-macro",
            ),
            (r#"include!("/tmp/x.rs");"#, "forbidden-macro"),
            (r#"const X: &str = env!("HOME");"#, "forbidden-macro"),
            (
                r#"const X: Option<&str> = option_env!("HOME");"#,
                "forbidden-macro",
            ),
            ("extern crate libc;", "extern-crate"),
            (r#"#[path = "/etc/x.rs"] mod m;"#, "path-attribute"),
            (
                r#"#[cfg_attr(all(), path = "/etc/x.rs")] mod m;"#,
                "path-attribute",
            ),
            ("#![allow(unsafe_code)]\nfn f() {}", "crate-attribute"),
            ("#![feature(x)]", "crate-attribute"),
            ("use std::include_str;", "forbidden-macro"),
            // Hidden in a macro_rules body or passed as a bare ident.
            (
                r#"macro_rules! m { () => { include_str!("/etc/passwd") } }"#,
                "forbidden-macro",
            ),
            (
                "macro_rules! m { ($n:ident) => { $n!(\"/x\") } } m!(include_str);",
                "forbidden-macro",
            ),
            (
                "macro_rules! m { () => { extern crate libc; } }",
                "extern-crate",
            ),
            (
                r##"macro_rules! m { () => { #[path = "/x"] mod q; } }"##,
                "path-attribute",
            ),
        ];
        for (src, code) in cases {
            assert!(
                codes(src).contains(&(*code).to_string()),
                "{src} -> {:?}",
                codes(src)
            );
        }
    }

    #[test]
    fn parse_error_has_position() {
        let d = check_source("src/lib.rs", "fn f() {\n  let x = ;\n}");
        assert_eq!((d[0].code.as_str(), d[0].line), ("parse", 2));
    }

    #[test]
    fn diagnostics_carry_file_line_and_a_hint() {
        let d = check_source("src/a.rs", "\n\nextern crate x;");
        assert_eq!(
            (d[0].file.as_str(), d[0].line, d[0].col),
            ("src/a.rs", 3, 1)
        );
        assert!(d[0].suggestion.is_some());
    }
}
