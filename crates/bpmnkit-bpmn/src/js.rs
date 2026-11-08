//! JS semantics the builder and text crates need to match TS byte for byte.

use indexmap::IndexMap;

pub use crate::number::{is_js_space, js_number, js_number_to_string, js_trim};

/// `s.length`: UTF-16 code units.
pub fn utf16_len(s: &str) -> usize {
    s.encode_utf16().count()
}

/// Whether `key` is an array index (`0` … `2^32 - 2`, canonical), which JS objects list
/// before every other key.
pub fn is_array_index(key: &str) -> bool {
    if key.is_empty() || key.len() > 10 || !key.bytes().all(|b| b.is_ascii_digit()) {
        return false;
    }
    if key.len() > 1 && key.starts_with('0') {
        return false;
    }
    key.parse::<u64>().is_ok_and(|n| n < u64::from(u32::MAX))
}

/// `Object.entries` order of a `Record<string, V>` built in `map`'s insertion order: array
/// indices ascending, then the other keys as inserted.
pub fn object_entries<V>(map: &IndexMap<String, V>) -> Vec<(&String, &V)> {
    let mut indices: Vec<(&String, &V)> = map.iter().filter(|(k, _)| is_array_index(k)).collect();
    indices.sort_by_key(|(k, _)| k.parse::<u64>().unwrap_or(0));
    indices.extend(map.iter().filter(|(k, _)| !is_array_index(k)));
    indices
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn integer_keys_come_first() {
        let mut m = IndexMap::new();
        m.insert("b".to_owned(), 1);
        m.insert("10".to_owned(), 2);
        m.insert("2".to_owned(), 3);
        m.insert("01".to_owned(), 4);
        let keys: Vec<&str> = object_entries(&m)
            .into_iter()
            .map(|(k, _)| k.as_str())
            .collect();
        assert_eq!(keys, ["2", "10", "b", "01"]);
    }
}
