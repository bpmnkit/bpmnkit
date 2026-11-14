#![doc = include_str!("../README.md")]
#![forbid(unsafe_code)]

use std::fmt;

/// The viewer script (`@bpmnkit/viewer-lite`, minified IIFE, about 8.5 KB gzip). It defines
/// the `BpmnLite` global and, once the document is parsed, replaces every
/// `<script type="application/bpmn+xml">` element with the rendered diagram.
/// Safe to inline: it holds no `</script`.
pub const VIEWER_JS: &str = include_str!("../assets/viewer-lite.min.js");

/// The open/drop script: the `#bpmn-open` file picker and dropping a file on the page
/// render into the first `.bpmn-lite` element. Run it after [`VIEWER_JS`], and only on a
/// page that has the picker (see [`HtmlOptions::no_picker`]).
pub const LOADER_JS: &str = include_str!("../assets/loader.js");

/// The page style (background, light/dark colours, drop outline). It styles `html` and
/// `body` too, so on a page with its own design you may leave it out: the diagram renders
/// without it.
pub const CSS: &str = include_str!("../assets/viewer.css");

const DEFAULT_TITLE: &str = "BPMN diagram";
const PICKER: &str = r#"<header><label>Open <input type="file" id="bpmn-open" accept=".bpmn,.xml"></label></header>"#;
const EMPTY_VIEWER: &str =
    r#"<div class="bpmn-lite" data-bpmn-lite="message">Open or drop a .bpmn file</div>"#;

/// Why a page could not be made.
#[derive(Debug, Clone, PartialEq, Eq)]
#[non_exhaustive]
pub enum ViewerError {
    /// The XML has a real `<script>` element (a `</script` outside CDATA and comments),
    /// which no escape can hide inside an HTML `<script>` element.
    ScriptElement,
    /// A [`Colors`] value is not plain colour syntax (hex, name, `rgb()`/`hsl()`/`oklch()`,
    /// at most 64 characters) or uses `url(`, `var(` or `expression`: it could break out of
    /// the CSS.
    InvalidColor {
        /// The colour key, as in [`Colors`] (`"bg"`, `"pool-header"`, ...).
        key: &'static str,
        /// The rejected value.
        value: String,
    },
}

impl fmt::Display for ViewerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ViewerError::ScriptElement => f.write_str(
                "The BPMN XML contains a <script> element, which cannot be inlined in HTML",
            ),
            ViewerError::InvalidColor { key, value } => {
                write!(f, "Invalid colour for \"{key}\": {value:?}")
            }
        }
    }
}

impl std::error::Error for ViewerError {}

/// The page colour scheme. Without a theme the page is light.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Theme {
    /// Light colours (the default look); sets `data-theme="light"`.
    Light,
    /// Dark colours.
    Dark,
    /// Light, dark when the reader's `prefers-color-scheme` is dark.
    Auto,
}

impl Theme {
    fn name(self) -> &'static str {
        match self {
            Theme::Light => "light",
            Theme::Dark => "dark",
            Theme::Auto => "auto",
        }
    }
}

/// Brand colours, written as `--bpmnkit-viewer-*` CSS variables that the page and the
/// viewer both read. Unset fields keep the theme's colour. Values are checked (see
/// [`ViewerError::InvalidColor`]).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Colors {
    /// Page and diagram background (`--bpmnkit-viewer-bg`).
    pub bg: Option<String>,
    /// Shape fill (`--bpmnkit-viewer-fill`).
    pub fill: Option<String>,
    /// Shape outline (`--bpmnkit-viewer-stroke`).
    pub stroke: Option<String>,
    /// Sequence and message flows (`--bpmnkit-viewer-flow`).
    pub flow: Option<String>,
    /// Labels (`--bpmnkit-viewer-text`).
    pub text: Option<String>,
    /// Pool and lane header fill (`--bpmnkit-viewer-pool-header`).
    pub pool_header: Option<String>,
    /// Outline behind labels (`--bpmnkit-viewer-halo`).
    pub halo: Option<String>,
}

impl Colors {
    /// Key, CSS variable suffix and value, in the order the variables are written.
    fn entries(&self) -> [(&'static str, &Option<String>); 7] {
        [
            ("bg", &self.bg),
            ("fill", &self.fill),
            ("stroke", &self.stroke),
            ("flow", &self.flow),
            ("text", &self.text),
            ("pool-header", &self.pool_header),
            ("halo", &self.halo),
        ]
    }

    /// `:root{...}` for the set keys, or "". Checks every value first.
    fn css(&self) -> Result<String, ViewerError> {
        let mut decls = Vec::new();
        for (key, value) in self.entries() {
            let Some(value) = value else { continue };
            if !valid_color(value) {
                return Err(ViewerError::InvalidColor {
                    key,
                    value: value.clone(),
                });
            }
            decls.push(format!("--bpmnkit-viewer-{key}:{value}"));
        }
        Ok(if decls.is_empty() {
            String::new()
        } else {
            format!(":root{{{}}}", decls.join(";"))
        })
    }
}

// Plain colour syntax only, as the JS `^[#a-zA-Z0-9(),.% /-]{1,64}$`; no quotes, braces,
// `;`, `\` or `<`, and nothing that loads a resource.
fn valid_color(v: &str) -> bool {
    let plain = (1..=64).contains(&v.len())
        && v.bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"#(),.% /-".contains(&b));
    let lower = v.to_ascii_lowercase();
    plain
        && !["url(", "var(", "expression"]
            .iter()
            .any(|w| lower.contains(w))
}

/// Options for [`to_html`] and [`parts`]. `HtmlOptions::default()` matches the JS
/// `toHtml(xml)` defaults.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HtmlOptions {
    title: String,
    picker: bool,
    theme: Option<Theme>,
    colors: Colors,
}

impl Default for HtmlOptions {
    fn default() -> Self {
        HtmlOptions {
            title: DEFAULT_TITLE.to_owned(),
            picker: true,
            theme: None,
            colors: Colors::default(),
        }
    }
}

impl HtmlOptions {
    /// The page's `<title>` (HTML-escaped for you). Default: "BPMN diagram".
    pub fn title(mut self, title: impl Into<String>) -> Self {
        self.title = title.into();
        self
    }

    /// The colour scheme, also set as `data-theme` on the page and the diagram script.
    /// Default: none (light).
    pub fn theme(mut self, theme: Theme) -> Self {
        self.theme = Some(theme);
        self
    }

    /// Brand colours on top of the theme.
    pub fn colors(mut self, colors: Colors) -> Self {
        self.colors = colors;
        self
    }

    /// Leave out the "Open" file picker, drag-and-drop and [`LOADER_JS`]: a read-only
    /// diagram. Use it when you embed several diagrams in one page. (Rust-only; the JS
    /// `toHtml` always has the picker.)
    pub fn no_picker(mut self) -> Self {
        self.picker = false;
        self
    }
}

/// The viewer split by where each piece goes in a page you write yourself.
///
/// ```html
/// <!doctype html>
/// <html>
///   <head>
///     <meta charset="utf-8">
///     {head}        <!-- style; once per page -->
///   </head>
///   <body{body_attrs}>   <!-- body_attrs is "" unless a theme is set -->
///     <h1>Your page</h1>
///     {body}        <!-- where the diagram goes; one per diagram -->
///     {scripts}     <!-- before </body>; once per page, however many diagrams -->
///   </body>
/// </html>
/// ```
///
/// `body_attrs` (` data-theme="dark"`, or empty) goes on your `<body>` so the page colours
/// follow the theme; the diagram script in `body` carries its own `data-theme`. The page
/// must be UTF-8. [`to_html`] is exactly this skeleton with the picker and a
/// title. To serve the scripts as files (for a `script-src 'self'` CSP), use [`VIEWER_JS`]
/// and [`LOADER_JS`] instead of `scripts`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ViewerParts {
    /// `<style>` element: put it in `<head>`. Optional (see [`CSS`]).
    pub head: String,
    /// Attributes for your `<body>` tag, with a leading space: ` data-theme="X"` when a
    /// theme is set, else empty.
    pub body_attrs: String,
    /// The diagram: the picker `<header>` (unless [`HtmlOptions::no_picker`]) and the
    /// escaped `<script type="application/bpmn+xml">` element, or the "Open or drop a
    /// .bpmn file" placeholder for blank XML. Put it where the diagram should appear.
    pub body: String,
    /// The viewer script, then the open/drop script: put them before `</body>`, once per
    /// page.
    pub scripts: String,
}

/// One self-contained HTML page showing the diagram: no network, no other files. The
/// page has a file picker and accepts a dropped `.bpmn` file; blank `xml` gives an empty
/// viewer that only shows that hint. The bytes are the same as the JS
/// `toHtml(xml, { title, theme, colors })` of `@bpmnkit/viewer-lite`.
///
/// Serve it as `text/html; charset=utf-8`, or send it as a `.html` file (a Slack upload,
/// an email attachment): it opens offline in any browser.
///
/// ```
/// let page = bpmnkit_viewer::to_html("", &Default::default())?;
/// assert!(page.contains("Open or drop a .bpmn file"));
/// # Ok::<(), bpmnkit_viewer::ViewerError>(())
/// ```
pub fn to_html(xml: &str, options: &HtmlOptions) -> Result<String, ViewerError> {
    let ViewerParts {
        head,
        body_attrs,
        body,
        scripts,
    } = parts(xml, options)?;
    Ok(format!(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{}</title>{head}</head><body{body_attrs}>{body}{scripts}</body></html>\n",
        escape_html(&options.title)
    ))
}

/// An empty viewer page: only the picker and the drop target. Same as `to_html("", options)`.
pub fn empty_html(options: &HtmlOptions) -> String {
    // Blank XML is never escaped, so it cannot fail.
    to_html("", options).unwrap_or_default()
}

/// The viewer for your own page; see [`ViewerParts`] for where each field goes.
///
/// ```
/// use bpmnkit_viewer::{parts, HtmlOptions};
///
/// let xml = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"/>"#;
/// let p = parts(xml, &HtmlOptions::default().no_picker())?;
/// let page = format!(
///     "<!doctype html><html><head><meta charset=\"utf-8\">{}</head><body><h1>Order</h1>{}{}</body></html>",
///     p.head, p.body, p.scripts,
/// );
/// assert!(page.contains(r#"<script type="application/bpmn+xml"><bpmn:definitions"#));
/// # Ok::<(), bpmnkit_viewer::ViewerError>(())
/// ```
pub fn parts(xml: &str, options: &HtmlOptions) -> Result<ViewerParts, ViewerError> {
    let mut css = String::new();
    if let Some(theme @ (Theme::Dark | Theme::Auto)) = options.theme {
        let rule = ":root{--bpmnkit-viewer-bg:#1e1e2e;--bpmnkit-viewer-text:#cdd6f4}";
        if theme == Theme::Dark {
            css.push_str(rule);
        } else {
            css.push_str(&format!("@media (prefers-color-scheme:dark){{{rule}}}"));
        }
    }
    css.push_str(&options.colors.css()?);
    let theme_attr = options
        .theme
        .map(|t| format!(" data-theme=\"{}\"", t.name()))
        .unwrap_or_default();
    let diagram = if is_blank(xml) {
        EMPTY_VIEWER.to_owned()
    } else {
        format!(
            "<script type=\"application/bpmn+xml\"{theme_attr}>{}</script>",
            escape_xml_for_script(xml)?
        )
    };
    let (picker, loader) = if options.picker {
        (PICKER, format!("<script>{LOADER_JS}</script>"))
    } else {
        ("", String::new())
    };
    Ok(ViewerParts {
        head: format!("<style>{CSS}{css}</style>"),
        body_attrs: theme_attr,
        body: format!("{picker}{diagram}"),
        scripts: format!("<script>{VIEWER_JS}</script>{loader}"),
    })
}

/// Makes BPMN XML safe inside `<script type="application/bpmn+xml">` without changing what
/// it parses to. An HTML parser ends that element at the first `</script` (any case), and
/// the viewer reads the raw text, so only XML-level escapes work: inside CDATA the section
/// is closed and reopened around it, inside a comment it becomes `<\/script`. Elsewhere it
/// can only be a real `<script>` element, which is an error.
pub fn escape_xml_for_script(xml: &str) -> Result<String, ViewerError> {
    const CDATA: &str = "<![CDATA[";
    const COMMENT: &str = "<!--";
    let mut out = String::with_capacity(xml.len());
    let mut last = 0;
    let mut i = 0;
    while let Some(rel) = xml[i..].find("<!") {
        let at = i + rel;
        let rest = &xml[at..];
        let literal = if let Some(inner) = rest.strip_prefix(CDATA) {
            inner.find("]]>").map(|e| (true, CDATA.len() + e + 3))
        } else if let Some(inner) = rest.strip_prefix(COMMENT) {
            inner.find("-->").map(|e| (false, COMMENT.len() + e + 3))
        } else {
            None
        };
        // An unterminated section is plain text, as in the JS regex.
        let Some((cdata, len)) = literal else {
            i = at + 2;
            continue;
        };
        out.push_str(plain(&xml[last..at])?);
        let text = &xml[at..at + len];
        let mut from = 0;
        for end in find_end_tags(text) {
            out.push_str(&text[from..end]);
            // `end` points at `</script`; keep the original case of "script".
            out.push_str(if cdata { "</]]><![CDATA[" } else { "<\\/" });
            from = end + 2;
        }
        out.push_str(&text[from..]);
        last = at + len;
        i = last;
    }
    out.push_str(plain(&xml[last..])?);
    Ok(out)
}

fn plain(s: &str) -> Result<&str, ViewerError> {
    if find_end_tags(s).next().is_some() {
        Err(ViewerError::ScriptElement)
    } else {
        Ok(s)
    }
}

/// Byte offsets of each `</script`, ASCII case-insensitive.
fn find_end_tags(s: &str) -> impl Iterator<Item = usize> + '_ {
    const TAG: &[u8] = b"</script";
    let bytes = s.as_bytes();
    (0..bytes.len().saturating_sub(TAG.len() - 1))
        .filter(move |&i| bytes[i..i + TAG.len()].eq_ignore_ascii_case(TAG))
}

// JS `String.prototype.trim` also strips U+FEFF, which Rust's `trim` keeps.
fn is_blank(s: &str) -> bool {
    s.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}')
        .is_empty()
}

fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

#[cfg(test)]
mod tests {
    use super::*;

    const XML: &str = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="P"/></bpmn:definitions>"#;

    fn embedded(html: &str) -> &str {
        let open = r#"<script type="application/bpmn+xml">"#;
        let start = html.find(open).expect("bpmn script") + open.len();
        let end = start + html[start..].find("</script>").expect("end");
        &html[start..end]
    }

    fn with_text(text: &str) -> String {
        XML.replace(
            r#"<bpmn:process id="P"/>"#,
            &format!(r#"<bpmn:process id="P"><bpmn:textAnnotation id="TA"><bpmn:text>{text}</bpmn:text></bpmn:textAnnotation></bpmn:process>"#),
        )
    }

    #[test]
    fn one_page_with_viewer_inlined_and_xml_embedded() {
        let html = to_html(XML, &HtmlOptions::default()).unwrap();
        assert!(html.starts_with("<!doctype html>"));
        assert!(!html.contains("{{BPMN}}"));
        assert!(!html.contains(" src="));
        assert_eq!(embedded(&html), XML);
        assert!(html.contains("BpmnLite"));
    }

    #[test]
    fn escaped_title() {
        let html = to_html(XML, &HtmlOptions::default().title("A <b> & c")).unwrap();
        assert!(html.contains("<title>A &lt;b&gt; &amp; c</title>"));
        assert!(to_html(XML, &HtmlOptions::default())
            .unwrap()
            .contains("<title>BPMN diagram</title>"));
    }

    #[test]
    fn end_tag_in_text_is_already_an_entity() {
        let input = with_text("a &lt;/script&gt; b &lt;/ScRiPt c");
        let html = to_html(&input, &HtmlOptions::default()).unwrap();
        assert_eq!(embedded(&html), input);
    }

    #[test]
    fn end_tag_in_cdata_splits_the_section() {
        let input = with_text("<![CDATA[if (a) </script> else </SCRIPT>]]>");
        let html = to_html(&input, &HtmlOptions::default()).unwrap();
        let body = embedded(&html);
        assert!(!body.to_ascii_lowercase().contains("</script"));
        assert_eq!(body.replace("]]><![CDATA[", ""), input);
    }

    #[test]
    fn end_tag_in_comment() {
        let out = escape_xml_for_script("x<!-- </Script> -->y").unwrap();
        assert_eq!(out, r"x<!-- <\/Script> -->y");
    }

    #[test]
    fn refuses_a_script_element() {
        let err = escape_xml_for_script("<a><script>1</script></a>").unwrap_err();
        assert!(err.to_string().contains("<script>"));
        assert!(to_html("<a></SCRIPT></a>", &HtmlOptions::default()).is_err());
    }

    #[test]
    fn unterminated_sections_are_plain() {
        assert_eq!(escape_xml_for_script("<a><!-- x").unwrap(), "<a><!-- x");
        assert!(escape_xml_for_script("<![CDATA[ </script>").is_err());
        // `<!-->` does not close itself.
        assert_eq!(
            escape_xml_for_script("<!--> </script> -->").unwrap(),
            r"<!--> <\/script> -->"
        );
    }

    #[test]
    fn leaves_unrelated_cdata_and_comments_alone() {
        let s = "<a><!-- c --><![CDATA[x < y]]>ü</a>";
        assert_eq!(escape_xml_for_script(s).unwrap(), s);
    }

    #[test]
    fn picker_and_drop_in_every_page() {
        for html in [
            to_html(XML, &HtmlOptions::default()).unwrap(),
            empty_html(&HtmlOptions::default()),
        ] {
            assert!(html.contains(r#"<input type="file" id="bpmn-open" accept=".bpmn,.xml">"#));
            assert!(html.contains("ondrop") && html.contains("ondragover"));
        }
    }

    #[test]
    fn empty_viewer_for_blank_xml() {
        for blank in ["", "  \n", "\u{feff}"] {
            let html = to_html(blank, &HtmlOptions::default()).unwrap();
            assert!(!html.contains(r#"<script type="application/bpmn+xml">"#));
            assert!(html.contains("Open or drop a .bpmn file"));
        }
    }

    #[test]
    fn parts_without_picker() {
        let p = parts(XML, &HtmlOptions::default().no_picker()).unwrap();
        assert_eq!(p.head, format!("<style>{CSS}</style>"));
        assert!(!p.body.contains("bpmn-open"));
        assert_eq!(p.scripts, format!("<script>{VIEWER_JS}</script>"));
        let full = parts(XML, &HtmlOptions::default()).unwrap();
        assert!(full.body.starts_with("<header>"));
        assert!(full
            .scripts
            .ends_with(&format!("<script>{LOADER_JS}</script>")));
    }

    #[test]
    fn theme_and_colors() {
        let o = HtmlOptions::default().theme(Theme::Dark).colors(Colors {
            bg: Some("#fff".into()),
            pool_header: Some("rgb(1, 2, 3)".into()),
            ..Colors::default()
        });
        let p = parts(XML, &o).unwrap();
        assert!(p.head.ends_with(
            ":root{--bpmnkit-viewer-bg:#1e1e2e;--bpmnkit-viewer-text:#cdd6f4}:root{--bpmnkit-viewer-bg:#fff;--bpmnkit-viewer-pool-header:rgb(1, 2, 3)}</style>"
        ));
        assert_eq!(p.body_attrs, r#" data-theme="dark""#);
        assert!(p
            .body
            .contains(r#"<script type="application/bpmn+xml" data-theme="dark">"#));
        let auto = parts("", &HtmlOptions::default().theme(Theme::Auto)).unwrap();
        assert!(auto.head.ends_with("@media (prefers-color-scheme:dark){:root{--bpmnkit-viewer-bg:#1e1e2e;--bpmnkit-viewer-text:#cdd6f4}}</style>"));
        assert!(!auto.body.contains("data-theme"));
        let none = parts(XML, &HtmlOptions::default()).unwrap();
        assert_eq!(none.head, format!("<style>{CSS}</style>"));
        assert_eq!(none.body_attrs, "");
    }

    #[test]
    fn rejects_unsafe_colors() {
        for bad in [
            "",
            "red;}",
            "url(x)",
            "VAR(--a)",
            "expression(1)",
            "a\"b",
            "é",
            &"a".repeat(65),
        ] {
            let o = HtmlOptions::default().colors(Colors {
                flow: Some(bad.into()),
                ..Colors::default()
            });
            assert!(
                matches!(
                    parts(XML, &o),
                    Err(ViewerError::InvalidColor { key: "flow", .. })
                ),
                "{bad:?}"
            );
        }
    }

    #[test]
    fn assets_are_safe_to_inline() {
        for s in [VIEWER_JS, LOADER_JS] {
            assert!(find_end_tags(s).next().is_none());
        }
        assert!(!CSS.contains("</style"));
    }
}
