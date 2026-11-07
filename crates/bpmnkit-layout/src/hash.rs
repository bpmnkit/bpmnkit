//! The maps and sets the layout uses internally.
//!
//! Keys are element ids and grid coordinates hashed many times per layout, where
//! SipHash's DoS resistance buys nothing and costs a large share of the run.
//! `IndexMap` iterates in insertion order whatever the hasher, so swapping it
//! cannot change any output.

use std::hash::{BuildHasherDefault, Hasher};

/// The multiply-rotate hash rustc uses for its own tables.
#[derive(Default, Clone, Copy)]
pub struct FxHasher {
    hash: u64,
}

const SEED: u64 = 0x51_7c_c1_b7_27_22_0a_95;

impl FxHasher {
    #[inline]
    fn add(&mut self, word: u64) {
        self.hash = (self.hash.rotate_left(5) ^ word).wrapping_mul(SEED);
    }
}

impl Hasher for FxHasher {
    #[inline]
    fn write(&mut self, bytes: &[u8]) {
        // Ids are mostly 8 to 16 bytes: two overlapping words cover one whole, so
        // a string costs one wide multiply instead of a round per word.
        let len = bytes.len();
        let mut acc = self.hash ^ len as u64;
        let mut rest = bytes;
        while rest.len() > 16 {
            let (a, b) = (word(&rest[..8]), word(&rest[8..16]));
            acc = fold(acc ^ a, b ^ SEED);
            rest = &rest[16..];
        }
        let (a, b) = match rest.len() {
            8..=16 => (word(&rest[..8]), word(&rest[rest.len() - 8..])),
            4..=7 => (
                u64::from(half(&rest[..4])),
                u64::from(half(&rest[rest.len() - 4..])),
            ),
            1..=3 => (
                u64::from(rest[0]) | u64::from(rest[rest.len() / 2]) << 8,
                u64::from(rest[rest.len() - 1]),
            ),
            _ => (0, 0),
        };
        self.hash = fold(acc ^ a, b ^ SEED);
    }

    #[inline]
    fn write_u8(&mut self, i: u8) {
        self.add(u64::from(i));
    }

    #[inline]
    fn write_u32(&mut self, i: u32) {
        self.add(u64::from(i));
    }

    #[inline]
    fn write_u64(&mut self, i: u64) {
        self.add(i);
    }

    #[inline]
    fn write_i64(&mut self, i: i64) {
        self.add(i as u64);
    }

    #[inline]
    fn write_usize(&mut self, i: usize) {
        self.add(i as u64);
    }

    #[inline]
    fn finish(&self) -> u64 {
        self.hash
    }
}

fn word(bytes: &[u8]) -> u64 {
    let mut w = [0u8; 8];
    w.copy_from_slice(&bytes[..8]);
    u64::from_le_bytes(w)
}

fn half(bytes: &[u8]) -> u32 {
    let mut w = [0u8; 4];
    w.copy_from_slice(&bytes[..4]);
    u32::from_le_bytes(w)
}

/// The high and low halves of the full product, xored: every input bit reaches
/// every output bit.
fn fold(a: u64, b: u64) -> u64 {
    let full = u128::from(a) * u128::from(b);
    (full as u64) ^ ((full >> 64) as u64)
}

pub type FxBuildHasher = BuildHasherDefault<FxHasher>;
pub type IndexMap<K, V> = indexmap::IndexMap<K, V, FxBuildHasher>;
pub type IndexSet<T> = indexmap::IndexSet<T, FxBuildHasher>;
