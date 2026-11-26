//! ed25519 signature over a component digest plus the manifest's canonical JSON.

pub use ed25519_dalek::{Signature, SigningKey, VerifyingKey};
use ed25519_dalek::{Signer, Verifier};

use crate::api::Digest;
use crate::manifest::ValidManifest;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SignError {
    BadHex(String),
    BadLength {
        what: &'static str,
        want: usize,
        got: usize,
    },
    BadKey(String),
    /// Wrong key, or digest or manifest changed after signing.
    Invalid,
}

impl std::fmt::Display for SignError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BadHex(e) => write!(f, "invalid hex: {e}"),
            Self::BadLength { what, want, got } => {
                write!(f, "{what} must be {want} bytes, got {got}")
            }
            Self::BadKey(e) => write!(f, "invalid key: {e}"),
            Self::Invalid => f.write_str("signature does not match digest and manifest"),
        }
    }
}
impl std::error::Error for SignError {}

pub fn encode_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// Whitespace around the hex (a trailing newline in a key file) is ignored.
pub fn decode_hex(s: &str) -> Result<Vec<u8>, SignError> {
    let s = s.trim();
    if !s.len().is_multiple_of(2) || !s.is_ascii() {
        return Err(SignError::BadHex("odd length or non-ascii".into()));
    }
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).map_err(|e| SignError::BadHex(e.to_string())))
        .collect()
}

fn array32(what: &'static str, s: &str) -> Result<[u8; 32], SignError> {
    let v = decode_hex(s)?;
    let got = v.len();
    v.try_into().map_err(|_| SignError::BadLength {
        what,
        want: 32,
        got,
    })
}

/// 32-byte raw seed as hex.
pub fn signing_key_from_hex(s: &str) -> Result<SigningKey, SignError> {
    Ok(SigningKey::from_bytes(&array32("signing key", s)?))
}

pub fn verifying_key_from_hex(s: &str) -> Result<VerifyingKey, SignError> {
    VerifyingKey::from_bytes(&array32("verifying key", s)?)
        .map_err(|e| SignError::BadKey(e.to_string()))
}

/// The signed bytes: digest hex, a newline, the manifest as JSON (field order is fixed by the type).
pub fn signing_payload(digest: &Digest, manifest: &ValidManifest) -> Vec<u8> {
    let mut p = digest.as_hex().as_bytes().to_vec();
    p.push(b'\n');
    p.extend(serde_json::to_vec(manifest).expect("manifest serialises"));
    p
}

pub fn sign(key: &SigningKey, digest: &Digest, manifest: &ValidManifest) -> Signature {
    key.sign(&signing_payload(digest, manifest))
}

pub fn verify_signature(
    key: &VerifyingKey,
    digest: &Digest,
    manifest: &ValidManifest,
    sig: &Signature,
) -> Result<(), SignError> {
    key.verify(&signing_payload(digest, manifest), sig)
        .map_err(|_| SignError::Invalid)
}
