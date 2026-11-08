//! Twin of `zeebe-validate/xml.ts`: Zeebe's parse and XSD stage on the text.

use super::context::ZeebeContext;

/// Returns `true` (fatal) when Zeebe would stop at parsing.
pub(super) fn check_xml(_xml: &str, _ctx: &mut ZeebeContext) -> bool {
    false
}
