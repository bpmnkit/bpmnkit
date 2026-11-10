//! The self-contained HTML diff viewer template (`spec/templates/diff-viewer.{html,css,js}`),
//! shared with `@bpmnkit/core`'s `renderDiffHtml` so both fill in the same bytes.

pub use crate::generated::diff_viewer::DIFF_VIEWER_TEMPLATE;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_one_page_with_every_placeholder() {
        assert!(DIFF_VIEWER_TEMPLATE.starts_with("<!doctype html>"));
        for p in [
            "TITLE",
            "SUMMARY",
            "BEFORE_LABEL",
            "AFTER_LABEL",
            "BEFORE_SVG",
            "AFTER_SVG",
            "CHANGES",
            "DIFF_JSON",
        ] {
            assert!(
                DIFF_VIEWER_TEMPLATE.contains(&format!("{{{{{p}}}}}")),
                "{p}"
            );
        }
        // Inlined at generation time; a page that loads nothing has nothing left to fetch.
        assert!(!DIFF_VIEWER_TEMPLATE.contains("{{STYLE}}"));
        assert!(!DIFF_VIEWER_TEMPLATE.contains("{{SCRIPT}}"));
        assert!(!DIFF_VIEWER_TEMPLATE.contains("src="));
        assert!(!DIFF_VIEWER_TEMPLATE.contains("<link"));
    }
}
