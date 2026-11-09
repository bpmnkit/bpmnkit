//! One error type for everything the facade does, so `?` works across crates.

use std::fmt;

use crate::detect::DocKind;

/// Any failure from a `bpmnkit-*` crate, or from [`load`](crate::load) itself.
///
/// `#[non_exhaustive]`: new crates add variants. Each wraps the crate's own error and
/// keeps it as [`source`](std::error::Error::source).
#[derive(Debug)]
#[non_exhaustive]
pub enum Error {
    /// The input is none of the formats [`detect`](crate::detect) knows.
    Unrecognized,
    /// The input is a known format whose cargo feature is off.
    FeatureDisabled {
        kind: DocKind,
        feature: &'static str,
    },
    #[cfg(feature = "xml")]
    Xml(bpmnkit_xml::XmlError),
    #[cfg(feature = "bpmn")]
    Bpmn(bpmnkit_bpmn::ParseError),
    #[cfg(feature = "dmn")]
    Dmn(bpmnkit_dmn::ParseError),
    #[cfg(feature = "form")]
    Form(bpmnkit_form::ParseError),
    #[cfg(feature = "feel")]
    Feel(bpmnkit_feel::FeelError),
    #[cfg(feature = "text")]
    Text(bpmnkit_text::TextError),
    #[cfg(feature = "builder")]
    Build(bpmnkit_builder::BuildError),
    #[cfg(feature = "render")]
    Render(bpmnkit_render::RenderError),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Unrecognized => f.write_str(
                "unrecognized document: not BPMN, DMN, a form, process text or compact JSON",
            ),
            Error::FeatureDisabled { kind, feature } => {
                write!(
                    f,
                    "{kind:?} input needs the `{feature}` cargo feature of bpmnkit"
                )
            }
            #[cfg(feature = "xml")]
            Error::Xml(e) => write!(f, "XML: {e}"),
            #[cfg(feature = "bpmn")]
            Error::Bpmn(e) => write!(f, "BPMN: {e}"),
            #[cfg(feature = "dmn")]
            Error::Dmn(e) => write!(f, "DMN: {e}"),
            #[cfg(feature = "form")]
            Error::Form(e) => write!(f, "form: {e}"),
            #[cfg(feature = "feel")]
            Error::Feel(e) => write!(f, "FEEL: {e}"),
            #[cfg(feature = "text")]
            Error::Text(e) => write!(f, "text: {e}"),
            #[cfg(feature = "builder")]
            Error::Build(e) => write!(f, "build: {e}"),
            #[cfg(feature = "render")]
            Error::Render(e) => write!(f, "render: {e}"),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Error::Unrecognized | Error::FeatureDisabled { .. } => None,
            #[cfg(feature = "xml")]
            Error::Xml(e) => Some(e),
            #[cfg(feature = "bpmn")]
            Error::Bpmn(e) => Some(e),
            #[cfg(feature = "dmn")]
            Error::Dmn(e) => Some(e),
            #[cfg(feature = "form")]
            Error::Form(e) => Some(e),
            #[cfg(feature = "feel")]
            Error::Feel(e) => Some(e),
            #[cfg(feature = "text")]
            Error::Text(e) => Some(e),
            #[cfg(feature = "builder")]
            Error::Build(e) => Some(e),
            #[cfg(feature = "render")]
            Error::Render(e) => Some(e),
        }
    }
}

macro_rules! from {
    ($feature:literal, $variant:ident, $ty:ty) => {
        #[cfg(feature = $feature)]
        impl From<$ty> for Error {
            fn from(e: $ty) -> Self {
                Error::$variant(e)
            }
        }
    };
}

from!("xml", Xml, bpmnkit_xml::XmlError);
from!("bpmn", Bpmn, bpmnkit_bpmn::ParseError);
from!("dmn", Dmn, bpmnkit_dmn::ParseError);
from!("form", Form, bpmnkit_form::ParseError);
from!("feel", Feel, bpmnkit_feel::FeelError);
from!("text", Text, bpmnkit_text::TextError);
from!("builder", Build, bpmnkit_builder::BuildError);
from!("render", Render, bpmnkit_render::RenderError);
