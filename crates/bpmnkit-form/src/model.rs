//! The form model. Serializing it with serde gives the JSON `JSON.stringify(parseForm(x))`
//! gives in TS (key order aside; `conformance/form/` compares with sorted keys).

use crate::json::{JsNumber, Json};
use indexmap::IndexMap;
use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};

/// Layout positioning of a component.
///
/// `columns` has three states, as in TS: absent, `null` (the field spans its own row) and a
/// number.
#[derive(Debug, Clone, PartialEq, Default, Serialize)]
pub struct FormLayout {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub row: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub columns: Option<Option<JsNumber>>,
    /// Keys the model does not know (or whose value had an unexpected type), kept verbatim.
    #[serde(rename = "extraProps", skip_serializing_if = "Option::is_none")]
    pub extra_props: Option<IndexMap<String, Json>>,
}

/// Validation constraints. Keys the model does not know, or whose value has an unexpected type,
/// are kept in `extra_props`.
#[derive(Debug, Clone, PartialEq, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FormValidation {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_length: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_length: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pattern: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validation_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extra_props: Option<IndexMap<String, Json>>,
}

/// A label/value option of select, radio, checklist and taglist.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FormValueOption {
    pub label: String,
    pub value: String,
    /// Keys the model does not know, kept verbatim.
    #[serde(rename = "extraProps", skip_serializing_if = "Option::is_none")]
    pub extra_props: Option<IndexMap<String, Json>>,
}

/// form-js `conditional` block: the component is hidden while the FEEL expression is true.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FormConditional {
    pub hide: String,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FormExporter {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FormTableColumn {
    pub label: String,
    pub key: String,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FormIframeSecurity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub allow_scripts: Option<bool>,
}

/// Root form definition.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FormDefinition {
    pub id: String,
    #[serde(rename = "type")]
    pub type_: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_platform: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_platform_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exporter: Option<FormExporter>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub schema_version: Option<JsNumber>,
    pub components: Vec<FormComponent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generated: Option<bool>,
}

/// One form component: the fields every type shares plus the type-specific [`ComponentKind`].
#[derive(Debug, Clone, PartialEq)]
pub struct FormComponent {
    pub id: String,
    pub layout: Option<FormLayout>,
    pub conditional: Option<FormConditional>,
    /// Properties the model does not know, kept verbatim so a round trip is lossless.
    pub extra_props: Option<IndexMap<String, Json>>,
    pub kind: ComponentKind,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "type")]
pub enum ComponentKind {
    #[serde(rename = "text")]
    Text(TextProps),
    #[serde(rename = "textfield")]
    Textfield(FieldProps),
    #[serde(rename = "textarea")]
    Textarea(FieldProps),
    #[serde(rename = "select")]
    Select(SelectProps),
    #[serde(rename = "radio")]
    Radio(RadioProps),
    #[serde(rename = "checkbox")]
    Checkbox(CheckboxProps),
    #[serde(rename = "checklist")]
    Checklist(ChecklistProps),
    #[serde(rename = "group")]
    Group(GroupProps),
    #[serde(rename = "number")]
    Number(NumberProps),
    #[serde(rename = "datetime")]
    Datetime(DatetimeProps),
    #[serde(rename = "button")]
    Button(ButtonProps),
    #[serde(rename = "taglist")]
    Taglist(TaglistProps),
    #[serde(rename = "table")]
    Table(TableProps),
    #[serde(rename = "image")]
    Image(ImageProps),
    #[serde(rename = "dynamiclist")]
    DynamicList(DynamicListProps),
    #[serde(rename = "iframe")]
    Iframe(IframeProps),
    #[serde(rename = "separator")]
    Separator,
    #[serde(rename = "spacer")]
    Spacer(SpacerProps),
    #[serde(rename = "documentPreview")]
    DocumentPreview(DocumentPreviewProps),
    #[serde(rename = "html")]
    Html(HtmlProps),
    #[serde(rename = "expression")]
    Expression(ExpressionProps),
    #[serde(rename = "filepicker")]
    Filepicker(FilepickerProps),
    /// A component type the model does not know; serialized by [`FormComponent`] itself.
    #[serde(skip)]
    Unknown(FormUnknown),
}

/// A component of a type this model does not know (a form-js plugin's, or a newer one's).
///
/// `entries` holds every key as read, in order, so export writes them back unchanged. The
/// values stored under `id`, `type`, `layout` and `conditional` are the raw ones: the
/// component's own fields win when they are set.
#[derive(Debug, Clone, PartialEq)]
pub struct FormUnknown {
    pub type_: String,
    pub entries: IndexMap<String, Json>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct TextProps {
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
}

/// `textfield` and `textarea`.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<FormValueOption>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub searchable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RadioProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<FormValueOption>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values_expression: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct CheckboxProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
    #[serde(rename = "defaultValue", skip_serializing_if = "Option::is_none")]
    pub default_value: Option<bool>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChecklistProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<FormValueOption>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values_expression: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupProps {
    pub label: String,
    pub components: Vec<FormComponent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_outline: Option<bool>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NumberProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<JsNumber>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatetimeProps {
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtype: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date_label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub time_label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ButtonProps {
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaglistProps {
    pub label: String,
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<FormValueOption>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validate: Option<FormValidation>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TableProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data_source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub row_count: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub columns: Option<Vec<FormTableColumn>>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ImageProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DynamicListProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    pub components: Vec<FormComponent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_repeating: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub allow_add_remove: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_repetitions: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_outline: Option<bool>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct IframeProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<JsNumber>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security: Option<FormIframeSecurity>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct SpacerProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<JsNumber>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct DocumentPreviewProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct HtmlProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpressionProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compute_on: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FilepickerProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub multiple: Option<bool>,
}

impl ComponentKind {
    /// The `type` string of this component.
    pub fn type_name(&self) -> &str {
        match self {
            ComponentKind::Text(_) => "text",
            ComponentKind::Textfield(_) => "textfield",
            ComponentKind::Textarea(_) => "textarea",
            ComponentKind::Select(_) => "select",
            ComponentKind::Radio(_) => "radio",
            ComponentKind::Checkbox(_) => "checkbox",
            ComponentKind::Checklist(_) => "checklist",
            ComponentKind::Group(_) => "group",
            ComponentKind::Number(_) => "number",
            ComponentKind::Datetime(_) => "datetime",
            ComponentKind::Button(_) => "button",
            ComponentKind::Taglist(_) => "taglist",
            ComponentKind::Table(_) => "table",
            ComponentKind::Image(_) => "image",
            ComponentKind::DynamicList(_) => "dynamiclist",
            ComponentKind::Iframe(_) => "iframe",
            ComponentKind::Separator => "separator",
            ComponentKind::Spacer(_) => "spacer",
            ComponentKind::DocumentPreview(_) => "documentPreview",
            ComponentKind::Html(_) => "html",
            ComponentKind::Expression(_) => "expression",
            ComponentKind::Filepicker(_) => "filepicker",
            ComponentKind::Unknown(u) => &u.type_,
        }
    }
}

impl Serialize for FormComponent {
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        if let ComponentKind::Unknown(u) = &self.kind {
            let mut m = s.serialize_map(None)?;
            for (k, v) in &u.entries {
                match (k.as_str(), &self.layout, &self.conditional) {
                    ("id", _, _) => m.serialize_entry(k, &self.id)?,
                    ("type", _, _) => m.serialize_entry(k, &u.type_)?,
                    ("layout", Some(l), _) => m.serialize_entry(k, l)?,
                    ("conditional", _, Some(c)) => m.serialize_entry(k, c)?,
                    _ => m.serialize_entry(k, v)?,
                }
            }
            if let (Some(l), false) = (&self.layout, u.entries.contains_key("layout")) {
                m.serialize_entry("layout", l)?;
            }
            if let (Some(c), false) = (&self.conditional, u.entries.contains_key("conditional")) {
                m.serialize_entry("conditional", c)?;
            }
            return m.end();
        }

        #[derive(Serialize)]
        #[serde(rename_all = "camelCase")]
        struct Typed<'a> {
            #[serde(flatten)]
            kind: &'a ComponentKind,
            id: &'a str,
            #[serde(skip_serializing_if = "Option::is_none")]
            layout: &'a Option<FormLayout>,
            #[serde(skip_serializing_if = "Option::is_none")]
            conditional: &'a Option<FormConditional>,
            #[serde(skip_serializing_if = "Option::is_none")]
            extra_props: &'a Option<IndexMap<String, Json>>,
        }
        Typed {
            kind: &self.kind,
            id: &self.id,
            layout: &self.layout,
            conditional: &self.conditional,
            extra_props: &self.extra_props,
        }
        .serialize(s)
    }
}
