//! Twin of `feel-condition.ts`.

use crate::juel::{js_trim, translate_juel_to_feel, JuelToFeelOptions, JuelToFeelResult};

/// Turns a condition into the form Zeebe deploys: a FEEL expression with a leading `=`.
/// Zeebe reads text without `=` as a static value and rejects it on a condition. A Camunda 7
/// `${…}` goes through the migration's JUEL converter; one it cannot translate is left as
/// written, so the lint and deploy checks still name it instead of us guessing.
pub fn to_feel_condition(text: &str) -> String {
    let trimmed = js_trim(text);
    if trimmed.is_empty() || trimmed.starts_with('=') {
        return text.to_owned();
    }
    let juel = trimmed.len() >= 3
        && (trimmed.starts_with("${") || trimmed.starts_with("#{"))
        && trimmed.ends_with('}');
    if juel {
        return match translate_juel_to_feel(trimmed, JuelToFeelOptions::default()) {
            JuelToFeelResult::Ok { feel } => format!("={feel}"),
            JuelToFeelResult::Refused { .. } => text.to_owned(),
        };
    }
    format!("={trimmed}")
}

#[cfg(test)]
mod tests {
    use super::to_feel_condition;

    #[test]
    fn prefixes_plain_text_and_keeps_feel() {
        assert_eq!(to_feel_condition("  x > 1 "), "=x > 1");
        assert_eq!(to_feel_condition("= x > 1"), "= x > 1");
        assert_eq!(to_feel_condition(" =x"), " =x");
        assert_eq!(to_feel_condition("  "), "  ");
        assert_eq!(to_feel_condition(""), "");
    }

    #[test]
    fn translates_juel_and_leaves_untranslatable() {
        assert_eq!(to_feel_condition("${a > 1 && b}"), "=a > 1 and b");
        assert_eq!(to_feel_condition("#{approved}"), "=approved");
        assert_eq!(
            to_feel_condition("${execution.getVariable('x')}"),
            "${execution.getVariable('x')}"
        );
    }
}
