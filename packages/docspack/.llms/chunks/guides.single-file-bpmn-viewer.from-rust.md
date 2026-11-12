# One-File BPMN Viewer — From Rust

The `bpmnkit-viewer` crate (no dependencies; also `bpmnkit` with the `viewer` feature) makes the
same page, byte for byte, as `toHtml`. The viewer script is inside the crate, so nothing is read at
run time:

```rust
use bpmnkit_viewer::{to_html, HtmlOptions};

let page = to_html(&xml, &HtmlOptions::default().title("Order process"))?;
std::fs::write("order.html", page)?; // or upload it, e.g. as a Slack file
```

`empty_html(&opts)` is the empty viewer with the picker; `HtmlOptions::default().no_picker()` leaves
the picker out. To show the diagram in a page you already serve, `parts(&xml, &opts)` returns the
three pieces and says where each goes:

```html
<head>  … {head} …     </head>   <!-- <style>; optional, it also sets the page background -->
<body>  … {body} …               <!-- the diagram; one per diagram (use no_picker for several) -->
        {scripts}      </body>   <!-- viewer + open/drop script; once per page -->
```

`VIEWER_JS`, `LOADER_JS` and `CSS` are the raw assets, for serving the scripts as files under a
Content-Security-Policy without inline scripts. A real `<script>` element in the XML is an error
(`ViewerError::ScriptElement`); `</script` in CDATA or a comment is escaped without changing the XML.

---
Source: https://bpmnkit.com/docs/guides/single-file-bpmn-viewer
