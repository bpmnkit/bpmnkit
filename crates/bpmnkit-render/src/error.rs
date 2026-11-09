use std::fmt;

/// Why a model could not be rendered.
#[derive(Debug, Clone, PartialEq)]
#[non_exhaustive]
pub enum RenderError {
    /// The XML given to [`crate::bpmn_xml_to_svg`] did not parse.
    Parse(bpmnkit_bpmn::ParseError),
    /// The model has no diagram, and auto-layout is off or not compiled in.
    NoDiagram,
    /// [`crate::PlaneSelect`] named a plane that is not in the model.
    PlaneNotFound(String),
    /// The PNG would have more pixels than [`crate::PngOptions`] allows.
    TooLarge {
        width: u32,
        height: u32,
        max_pixels: u32,
    },
    /// The rasteriser failed (usvg parse or pixmap allocation).
    Raster(String),
}

impl fmt::Display for RenderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Parse(e) => write!(f, "invalid BPMN: {e}"),
            Self::NoDiagram => f.write_str("the model has no diagram to draw"),
            Self::PlaneNotFound(id) => write!(f, "no diagram plane matches \"{id}\""),
            Self::TooLarge {
                width,
                height,
                max_pixels,
            } => write!(
                f,
                "image of {width}x{height} px exceeds the limit of {max_pixels} pixels"
            ),
            Self::Raster(e) => write!(f, "rasterisation failed: {e}"),
        }
    }
}

impl std::error::Error for RenderError {}

impl From<bpmnkit_bpmn::ParseError> for RenderError {
    fn from(e: bpmnkit_bpmn::ParseError) -> Self {
        Self::Parse(e)
    }
}
