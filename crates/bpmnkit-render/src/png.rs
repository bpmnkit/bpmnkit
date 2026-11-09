//! SVG → PNG with resvg. The SVG is the contract; pixels are not a parity target.

use crate::{RenderError, RenderOptions, Svg};
use bpmnkit_bpmn::BpmnDefinitions;
use resvg::{tiny_skia, usvg};
use std::sync::{Arc, OnceLock};

/// Where the rasteriser finds glyphs.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
#[non_exhaustive]
pub enum FontSource {
    /// The bundled Inter subset (Latin, Latin-1, Latin Extended-A): the same pixels on every
    /// machine, including containers without fonts. Other scripts draw as missing glyphs.
    #[default]
    Embedded,
    /// The machine's fonts (feature `system-fonts`): wider coverage, output varies by machine.
    #[cfg(feature = "system-fonts")]
    System,
    /// The bundled font, then the machine's fonts for anything it lacks.
    #[cfg(feature = "system-fonts")]
    Both,
    /// The bundled font plus these font files (TTF/OTF/TTC bytes).
    Files(Vec<Vec<u8>>),
}

/// Options for [`svg_to_png`].
#[derive(Debug, Clone, PartialEq)]
#[non_exhaustive]
pub struct PngOptions {
    /// Device pixels per CSS px. Default 2 (sharp on high-DPI screens).
    pub dpi_scale: f32,
    /// Refuse images with more pixels than this ([`RenderError::TooLarge`]). Default 16 000 000.
    pub max_pixels: u32,
    pub fonts: FontSource,
}

impl Default for PngOptions {
    fn default() -> Self {
        Self {
            dpi_scale: 2.0,
            max_pixels: 16_000_000,
            fonts: FontSource::Embedded,
        }
    }
}

impl PngOptions {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn dpi_scale(mut self, dpi_scale: f32) -> Self {
        self.dpi_scale = dpi_scale;
        self
    }
    pub fn max_pixels(mut self, max_pixels: u32) -> Self {
        self.max_pixels = max_pixels;
        self
    }
    pub fn fonts(mut self, fonts: FontSource) -> Self {
        self.fonts = fonts;
        self
    }
}

/// Family name of the bundled font.
pub const EMBEDDED_FAMILY: &str = "Inter";
static INTER_REGULAR: &[u8] = include_bytes!("../assets/fonts/Inter-Regular-subset.otf");
static INTER_BOLD: &[u8] = include_bytes!("../assets/fonts/Inter-Bold-subset.otf");

fn with_embedded(db: &mut usvg::fontdb::Database) {
    db.load_font_data(INTER_REGULAR.to_vec());
    db.load_font_data(INTER_BOLD.to_vec());
    // `system-ui` is unknown to fontdb, so labels fall through to `sans-serif`.
    db.set_sans_serif_family(EMBEDDED_FAMILY);
}

/// Font databases are expensive to build (a system scan especially), so each is built once.
fn font_db(source: &FontSource) -> Arc<usvg::fontdb::Database> {
    static EMBEDDED: OnceLock<Arc<usvg::fontdb::Database>> = OnceLock::new();
    match source {
        FontSource::Embedded => EMBEDDED
            .get_or_init(|| {
                let mut db = usvg::fontdb::Database::new();
                with_embedded(&mut db);
                Arc::new(db)
            })
            .clone(),
        #[cfg(feature = "system-fonts")]
        FontSource::System => {
            static SYSTEM: OnceLock<Arc<usvg::fontdb::Database>> = OnceLock::new();
            SYSTEM
                .get_or_init(|| {
                    let mut db = usvg::fontdb::Database::new();
                    db.load_system_fonts();
                    Arc::new(db)
                })
                .clone()
        }
        #[cfg(feature = "system-fonts")]
        FontSource::Both => {
            static BOTH: OnceLock<Arc<usvg::fontdb::Database>> = OnceLock::new();
            BOTH.get_or_init(|| {
                let mut db = usvg::fontdb::Database::new();
                with_embedded(&mut db);
                db.load_system_fonts();
                db.set_sans_serif_family(EMBEDDED_FAMILY);
                Arc::new(db)
            })
            .clone()
        }
        FontSource::Files(files) => {
            let mut db = usvg::fontdb::Database::new();
            with_embedded(&mut db);
            for f in files {
                db.load_font_data(f.clone());
            }
            Arc::new(db)
        }
    }
}

/// Pixel size of a `width`×`height` CSS-px image at `dpi_scale`, refusing more than `max_pixels`.
pub(crate) fn pixel_size(
    width: f64,
    height: f64,
    png: &PngOptions,
) -> Result<(u32, u32), RenderError> {
    let scale = f64::from(png.dpi_scale);
    let px = |v: f64| {
        let p = (v * scale).ceil();
        if p.is_finite() && p >= 1.0 {
            p.min(f64::from(u32::MAX)) as u32
        } else {
            1
        }
    };
    let (w, h) = (px(width), px(height));
    if u64::from(w) * u64::from(h) > u64::from(png.max_pixels) {
        return Err(RenderError::TooLarge {
            width: w,
            height: h,
            max_pixels: png.max_pixels,
        });
    }
    Ok((w, h))
}

/// Rasterises a rendered SVG to PNG bytes. Size = `svg.width`×`svg.height` × `dpi_scale`.
pub fn svg_to_png(svg: &Svg, png: &PngOptions) -> Result<Vec<u8>, RenderError> {
    let (w, h) = pixel_size(svg.width, svg.height, png)?;
    let opt = usvg::Options {
        fontdb: font_db(&png.fonts),
        ..usvg::Options::default()
    };
    let tree =
        usvg::Tree::from_str(&svg.markup, &opt).map_err(|e| RenderError::Raster(e.to_string()))?;
    let mut pixmap = tiny_skia::Pixmap::new(w, h)
        .ok_or_else(|| RenderError::Raster(format!("cannot allocate a {w}x{h} pixmap")))?;
    let size = tree.size();
    let transform =
        tiny_skia::Transform::from_scale(w as f32 / size.width(), h as f32 / size.height());
    resvg::render(&tree, transform, &mut pixmap.as_mut());
    pixmap
        .encode_png()
        .map_err(|e| RenderError::Raster(e.to_string()))
}

/// [`crate::bpmn_to_svg`] then [`svg_to_png`].
pub fn bpmn_to_png(
    defs: &BpmnDefinitions,
    opts: &RenderOptions,
    png: &PngOptions,
) -> Result<Vec<u8>, RenderError> {
    svg_to_png(&crate::bpmn_to_svg(defs, opts)?, png)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pixel_size_rounds_up_and_guards() {
        let png = PngOptions::default();
        assert_eq!(pixel_size(100.5, 50.0, &png), Ok((201, 100)));
        assert_eq!(pixel_size(0.0, 0.0, &png), Ok((1, 1)));
        assert_eq!(
            pixel_size(4000.0, 3000.0, &png),
            Err(RenderError::TooLarge {
                width: 8000,
                height: 6000,
                max_pixels: 16_000_000
            })
        );
    }
}
