//! The generator's catalog of well-known public APIs: `CATALOG` and `getCatalogEntry` of
//! `catalog.ts`. The brand-colour icon helper (`getCatalogIconUri`) is not ported: it builds
//! base64 SVG data URIs and nothing in the Rust CLI needs them.

use crate::AuthHint;

/// One catalog entry.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CatalogEntry {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub url: &'static str,
    /// Suggested id prefix for generated templates.
    pub id_prefix: &'static str,
    pub default_auth: AuthHint,
}

pub use crate::catalog_data::CATALOG;

/// The entry with this id.
pub fn get_catalog_entry(id: &str) -> Option<&'static CatalogEntry> {
    CATALOG.iter().find(|e| e.id == id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_is_complete_and_unique() {
        assert!(CATALOG.len() >= 30);
        let github = get_catalog_entry("github").unwrap();
        assert_eq!(github.id_prefix, "io.github");
        assert_eq!(github.default_auth, AuthHint::Bearer);
        let mut ids: Vec<&str> = CATALOG.iter().map(|e| e.id).collect();
        ids.sort_unstable();
        ids.dedup();
        assert_eq!(ids.len(), CATALOG.len());
        assert!(get_catalog_entry("nope").is_none());
    }
}
