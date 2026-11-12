# One-File BPMN Viewer — From Rust or any other language

The package ships the finished page as `@bpmnkit/viewer-lite/template.html`, with the viewer inlined
and a `{{BPMN}}` placeholder where the XML goes. Copy it next to your code and replace the placeholder:

```rust
const TEMPLATE: &str = include_str!("template.html");

fn to_html(xml: &str) -> String {
    // Hide `</script` from the HTML parser. Text is already `&lt;/script` in valid XML; this
    // covers CDATA and comments. Do this before the replace, or `{{BPMN}}` text inside the XML
    // gets replaced too.
    let xml = xml.replace("</script", "&lt;/script");
    TEMPLATE.replacen("{{BPMN}}", &xml, 1)
}
```

`replacen(…, 1)` replaces only the first placeholder. This simple escape turns `</script` inside a CDATA
section into the literal text `&lt;/script`, which is fine for display but not byte-exact. Use `toHtml`
where that matters.

---
Source: https://bpmnkit.com/docs/guides/single-file-bpmn-viewer
