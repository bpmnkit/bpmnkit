# bpmnkit-viewer

A BPMN diagram as one self-contained HTML file, or the pieces to show it in a page you already have. No dependencies, no network at view time: the 8.5 KB viewer script is inside the page.

This is the Rust twin of `toHtml` from `@bpmnkit/viewer-lite`. The pages are byte-identical (the crate's tests compare them with pages the JS function made). Use it in a CLI, a web server or a chat bot: send the page as a `.html` file (for example a Slack file upload) and it opens offline in any browser, pannable and zoomable.

## Install

```sh
cargo add bpmnkit-viewer
```

Or through the facade: `cargo add bpmnkit --features viewer` (then `bpmnkit::viewer::…`).

## A whole page

```rust
use bpmnkit_viewer::{to_html, HtmlOptions};

let xml = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"/>"#;
let page = to_html(xml, &HtmlOptions::default().title("Order process"))?;
std::fs::write("order.html", page)?;
# std::fs::remove_file("order.html")?;
# Ok::<(), Box<dyn std::error::Error>>(())
```

The page has an "Open" file picker and accepts a dropped `.bpmn` file. `to_html("", …)` or `empty_html(…)` gives an empty viewer that shows only that hint. `HtmlOptions::default().no_picker()` leaves the picker out.

The page is light unless you set `HtmlOptions::default().theme(Theme::Dark)` (or `Theme::Auto`, which follows the reader's `prefers-color-scheme`). `.colors(Colors { bg: Some("#fff8e1".into()), ..Default::default() })` sets brand colours (`bg`, `fill`, `stroke`, `flow`, `text`, `pool_header`, `halo`) as `--bpmnkit-viewer-*` variables. Values are plain colour syntax (hex, names, `rgb()`, `hsl()`, `oklch()`); anything else, and `url(`, `var(`, `expression`, is `ViewerError::InvalidColor`.

Serve it as `text/html; charset=utf-8`. The diagram's XML must not contain a real `<script>` element (`ViewerError::ScriptElement`); `</script` in CDATA or a comment is escaped for you without changing the XML.

## Your own page: where each part goes

`parts(xml, &options)` returns `ViewerParts { head, body, scripts }`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    {head}        <!-- <style>: in <head>, once per page; optional -->
  </head>
  <body{body_attrs}>  <!-- body_attrs: empty, or data-theme="dark" when a theme is set -->
    <h1>Your page</h1>
    {body}        <!-- the diagram: where it should appear, one per diagram -->
    {scripts}     <!-- the viewer and the open/drop script: before </body>, once per page -->
  </body>
</html>
```

| Part | What it is | Where it goes |
|---|---|---|
| `head` | `<style>` with `CSS`, plus the theme and colour variables | In `<head>`. It also sets the `html`/`body` background, so skip it on a page with its own design. |
| `body_attrs` | ` data-theme="X"` when a theme is set, else empty | On your `<body>` tag, so the page colours follow the theme. |
| `body` | The picker `<header>` (unless `no_picker`) and `<script type="application/bpmn+xml">` holding the escaped XML (with `data-theme` when a theme is set) | Where the diagram should be. For several diagrams, call `parts` per diagram with `no_picker()` and use each `body`. |
| `scripts` | `<script>` with `VIEWER_JS`, then `<script>` with `LOADER_JS` (picker only) | Before `</body>`, once per page. |

```rust
use bpmnkit_viewer::{parts, HtmlOptions};

let xml = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"/>"#;
let p = parts(xml, &HtmlOptions::default().no_picker())?;
let page = format!(
    "<!doctype html><html><head><meta charset=\"utf-8\">{}</head>\
     <body><h1>Order</h1>{}{}</body></html>",
    p.head, p.body, p.scripts,
);
# assert!(page.contains("BpmnLite"));
# Ok::<(), bpmnkit_viewer::ViewerError>(())
```

With a Content-Security-Policy that forbids inline scripts, serve `VIEWER_JS` (and `LOADER_JS`) as files, say `/viewer-lite.min.js`, and put `<script src="/viewer-lite.min.js"></script>` where `scripts` would go. The diagram element in `body` is data (`type="application/bpmn+xml"`), not a script, so the CSP allows it. `escape_xml_for_script` is the escape `body` uses, for writing the element yourself.

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-viewer>
