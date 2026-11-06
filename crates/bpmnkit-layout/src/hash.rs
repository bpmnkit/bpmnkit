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
    fn write(&mut self, mut bytes: &[u8]) {
        while let Some((chunk, rest)) = bytes.split_first_chunk::<8>() {
            self.add(u64::from_le_bytes(*chunk));
            bytes = rest;
        }
        if let Some((chunk, rest)) = bytes.split_first_chunk::<4>() {
            self.add(u64::from(u32::from_le_bytes(*chunk)));
            bytes = rest;
        }
        for &b in bytes {
            self.add(u64::from(b));
        }
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

pub type FxBuildHasher = BuildHasherDefault<FxHasher>;
pub type IndexMap<K, V> = indexmap::IndexMap<K, V, FxBuildHasher>;
pub type IndexSet<T> = indexmap::IndexSet<T, FxBuildHasher>;
