//! Port of `plan/slug.ts`: readable ids from free text, deduped against ids in use.

use indexmap::IndexSet;

use crate::number::js_trim;

/// TS's `slugify`: runs of anything but ASCII letters and digits become `_`, edge `_`s go,
/// and an empty result is `"element"`.
pub fn slugify(text: &str) -> String {
    let mut slug = String::new();
    let mut in_run = false;
    for c in js_trim(text).chars() {
        if c.is_ascii_alphanumeric() {
            slug.push(c);
            in_run = false;
        } else if !in_run {
            slug.push('_');
            in_run = true;
        }
    }
    let slug = slug.trim_matches('_');
    if slug.is_empty() {
        "element".to_owned()
    } else {
        slug.to_owned()
    }
}

/// TS's `uniqueId`: `base`, or `base_2`, `base_3`, … if taken. Records the result in `taken`.
pub fn unique_id(base: &str, taken: &mut IndexSet<String>) -> String {
    if !taken.contains(base) {
        taken.insert(base.to_owned());
        return base.to_owned();
    }
    let mut n = 2u64;
    while taken.contains(&format!("{base}_{n}")) {
        n += 1;
    }
    let id = format!("{base}_{n}");
    taken.insert(id.clone());
    id
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slugify_matches_ts() {
        assert_eq!(slugify("  Review application! "), "Review_application");
        assert_eq!(slugify("Größe prüfen"), "Gr_e_pr_fen");
        assert_eq!(slugify("\u{feff}"), "element");
        assert_eq!(slugify("__a__b__"), "a_b");
        assert_eq!(slugify("😀x"), "x");
    }

    #[test]
    fn unique_id_numbers_from_two() {
        let mut taken = IndexSet::new();
        assert_eq!(unique_id("a", &mut taken), "a");
        assert_eq!(unique_id("a", &mut taken), "a_2");
        taken.insert("a_3".into());
        assert_eq!(unique_id("a", &mut taken), "a_4");
    }
}
