/// The colours a diagram is drawn in.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ThemeColors {
    pub bg: String,
    pub shape_fill: String,
    pub shape_stroke: String,
    pub flow_stroke: String,
    pub text: String,
    pub pool_header: String,
    pub text_halo: String,
}

impl ThemeColors {
    /// TS `LIGHT` in `svg.ts`.
    pub fn light() -> Self {
        Self {
            bg: "#f8f9fa".into(),
            shape_fill: "#ffffff".into(),
            shape_stroke: "#404040".into(),
            flow_stroke: "#404040".into(),
            text: "#333333".into(),
            pool_header: "rgba(0,0,0,0.04)".into(),
            text_halo: "#f8f9fa".into(),
        }
    }

    /// TS `DARK` in `svg.ts`.
    pub fn dark() -> Self {
        Self {
            bg: "#1e1e2e".into(),
            shape_fill: "#2a2a3e".into(),
            shape_stroke: "#8888bb".into(),
            flow_stroke: "#7777aa".into(),
            text: "#cdd6f4".into(),
            pool_header: "rgba(255,255,255,0.06)".into(),
            text_halo: "#1e1e2e".into(),
        }
    }
}

/// Visual theme.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub enum Theme {
    #[default]
    Light,
    Dark,
    Custom(ThemeColors),
}

impl Theme {
    pub fn colors(&self) -> ThemeColors {
        match self {
            Self::Light => ThemeColors::light(),
            Self::Dark => ThemeColors::dark(),
            Self::Custom(c) => c.clone(),
        }
    }
}

/// Where shape fill and stroke colours come from.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum ColorMode {
    /// Theme colours only (TS `exportSvg` default).
    #[default]
    Ignore,
    /// Honour `bioc:fill|stroke` / `color:background-color|border-color` on DI shapes and edges.
    Di,
}

/// Which `BPMNDiagram` to draw.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub enum PlaneSelect {
    /// The first diagram (TS `exportSvg` default).
    #[default]
    First,
    /// The diagram whose `BPMNDiagram` or `BPMNPlane` id is this.
    ById(String),
    /// The diagram whose plane shows this element (a process, collaboration or collapsed
    /// sub-process id).
    Process(String),
}

/// Default label font. A DI label style overrides it per label.
#[derive(Debug, Clone, PartialEq)]
pub struct FontOptions {
    /// CSS font-family list. Default `system-ui,-apple-system,sans-serif`.
    pub family: String,
    /// In px. Default 11.
    pub size: f64,
    /// In px. Default 14.
    pub line_height: f64,
}

impl Default for FontOptions {
    fn default() -> Self {
        Self {
            family: "system-ui,-apple-system,sans-serif".into(),
            size: 11.0,
            line_height: 14.0,
        }
    }
}

/// Options for [`crate::bpmn_to_svg`]. The default gives the same bytes as TS `exportSvg(defs)`.
#[derive(Debug, Clone, PartialEq)]
#[non_exhaustive]
pub struct RenderOptions {
    pub theme: Theme,
    /// Space around the diagram, in diagram units. Default 20.
    pub padding: f64,
    /// Multiplies `width`/`height` only; the viewBox does not change. Default 1.
    pub scale: f64,
    /// Fit inside this box (after `scale`); never upscales.
    pub max_size: Option<(f64, f64)>,
    pub colors: ColorMode,
    pub plane: PlaneSelect,
    /// Lay the model out first when the default plane has no shapes (needs feature
    /// `auto-layout`). Default false, like TS; turn it on for models without DI.
    pub auto_layout: bool,
    pub font: FontOptions,
    /// Add `data-element-id="…"` to each drawn element. Default false.
    pub element_ids: bool,
    /// Draw the background rect. Default true; false gives a transparent image.
    pub background: bool,
}

impl Default for RenderOptions {
    fn default() -> Self {
        Self {
            theme: Theme::Light,
            padding: 20.0,
            scale: 1.0,
            max_size: None,
            colors: ColorMode::Ignore,
            plane: PlaneSelect::First,
            auto_layout: false,
            font: FontOptions::default(),
            element_ids: false,
            background: true,
        }
    }
}

impl RenderOptions {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }
    pub fn padding(mut self, padding: f64) -> Self {
        self.padding = padding;
        self
    }
    pub fn scale(mut self, scale: f64) -> Self {
        self.scale = scale;
        self
    }
    pub fn max_size(mut self, width: f64, height: f64) -> Self {
        self.max_size = Some((width, height));
        self
    }
    pub fn colors(mut self, colors: ColorMode) -> Self {
        self.colors = colors;
        self
    }
    pub fn plane(mut self, plane: PlaneSelect) -> Self {
        self.plane = plane;
        self
    }
    pub fn auto_layout(mut self, on: bool) -> Self {
        self.auto_layout = on;
        self
    }
    pub fn font(mut self, font: FontOptions) -> Self {
        self.font = font;
        self
    }
    pub fn element_ids(mut self, on: bool) -> Self {
        self.element_ids = on;
        self
    }
    pub fn background(mut self, on: bool) -> Self {
        self.background = on;
        self
    }
}
