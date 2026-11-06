//! `parseForm`. Error messages and the order checks run in are TS's, case by case.

use crate::json::{JsNumber, Json};
use crate::model::*;
use bpmnkit_spec::elements::form_element;
use indexmap::IndexMap;
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError(pub String);

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for ParseError {}

type Res<T> = Result<T, ParseError>;
type Obj = IndexMap<String, Json>;

fn err<T>(msg: String) -> Res<T> {
    Err(ParseError(msg))
}

/// Keys every JS object already has through `Object.prototype`. TS asks `key in component`, so
/// an input key with one of these names is never treated as an unknown property.
const PROTOTYPE_KEYS: &[&str] = &[
    "__proto__",
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf",
];

/// Parses a Camunda Form JSON string into a [`FormDefinition`].
///
/// A syntax error carries serde_json's wording after the same prefix TS uses; V8's wording
/// is not reproduced.
pub fn parse_form(json: &str) -> Result<FormDefinition, ParseError> {
    let raw: Json = serde_json::from_str(json)
        .map_err(|e| ParseError(format!("Failed to parse form JSON: {e}")))?;
    let Json::Obj(obj) = raw else {
        return err("Form JSON must be an object".into());
    };
    let id = match obj.get("id") {
        Some(Json::Str(s)) if !s.is_empty() => s.clone(),
        _ => return err("Form must have a non-empty 'id' string".into()),
    };
    let Some(Json::Str(type_)) = obj.get("type") else {
        return err("Form must have a 'type' string".into());
    };
    let Some(Json::Arr(raw_components)) = obj.get("components") else {
        return err("Form must have a 'components' array".into());
    };
    let components = parse_components(raw_components, "components")?;

    let exporter = match obj.get("exporter") {
        Some(Json::Obj(e)) => Some(FormExporter {
            name: string_or_empty(e.get("name")),
            version: string_or_empty(e.get("version")),
        }),
        // typeof [] === "object"
        Some(Json::Arr(_)) => Some(FormExporter {
            name: String::new(),
            version: String::new(),
        }),
        _ => None,
    };
    Ok(FormDefinition {
        id,
        type_: type_.clone(),
        execution_platform: str_of(obj.get("executionPlatform")),
        execution_platform_version: str_of(obj.get("executionPlatformVersion")),
        exporter,
        schema_version: num_of(obj.get("schemaVersion")),
        components,
        generated: bool_of(obj.get("generated")),
    })
}

/// `String(v ?? "")`.
fn string_or_empty(v: Option<&Json>) -> String {
    match v {
        None | Some(Json::Null) => String::new(),
        Some(v) => v.to_js_string(),
    }
}

fn str_of(v: Option<&Json>) -> Option<String> {
    match v {
        Some(Json::Str(s)) => Some(s.clone()),
        _ => None,
    }
}

fn bool_of(v: Option<&Json>) -> Option<bool> {
    match v {
        Some(Json::Bool(b)) => Some(*b),
        _ => None,
    }
}

fn num_of(v: Option<&Json>) -> Option<JsNumber> {
    match v {
        Some(Json::Num(n)) => Some(JsNumber(*n)),
        _ => None,
    }
}

fn parse_components(raw: &[Json], path: &str) -> Res<Vec<FormComponent>> {
    raw.iter()
        .enumerate()
        .map(|(i, c)| parse_component(c, &format!("{path}[{i}]")))
        .collect()
}

/// Reads typed values out of a component's object and remembers which keys it took, so what
/// is left over becomes `extra_props`.
struct Props<'a> {
    obj: &'a Obj,
    used: Vec<&'static str>,
}

impl<'a> Props<'a> {
    fn new(obj: &'a Obj) -> Self {
        Props {
            obj,
            used: vec!["type", "id"],
        }
    }

    fn take<T>(
        &mut self,
        key: &'static str,
        f: impl FnOnce(Option<&'a Json>) -> Option<T>,
    ) -> Option<T> {
        let v = f(self.obj.get(key));
        if v.is_some() {
            self.used.push(key);
        }
        v
    }

    fn str(&mut self, key: &'static str) -> Option<String> {
        self.take(key, str_of)
    }

    fn bool(&mut self, key: &'static str) -> Option<bool> {
        self.take(key, bool_of)
    }

    fn num(&mut self, key: &'static str) -> Option<JsNumber> {
        self.take(key, num_of)
    }

    /// A key the component always carries, whatever the input held.
    fn mark(&mut self, key: &'static str) {
        self.used.push(key);
    }

    fn required_str(&mut self, key: &'static str, path: &str, ty: &str) -> Res<String> {
        match self.str(key) {
            Some(s) => Ok(s),
            None => err(format!("{path}: {ty} must have a '{key}' string")),
        }
    }

    fn validate(&mut self, path: &str) -> Res<Option<FormValidation>> {
        let v = parse_validation(self.obj.get("validate"), path)?;
        if v.is_some() {
            self.used.push("validate");
        }
        Ok(v)
    }

    fn values(&mut self, path: &str) -> Res<Option<Vec<FormValueOption>>> {
        match self.obj.get("values") {
            Some(Json::Arr(a)) => {
                self.used.push("values");
                parse_values(a, path).map(Some)
            }
            _ => Ok(None),
        }
    }

    fn has(&self, key: &str) -> bool {
        self.used.contains(&key) || PROTOTYPE_KEYS.contains(&key)
    }
}

fn parse_component(raw: &Json, path: &str) -> Res<FormComponent> {
    let Json::Obj(obj) = raw else {
        return err(format!("{path}: component must be an object"));
    };
    let Some(Json::Str(type_)) = obj.get("type") else {
        return err(format!("{path}: component must have a 'type' string"));
    };
    let id = match obj.get("id") {
        Some(Json::Str(s)) if !s.is_empty() => s.clone(),
        _ => return err(format!("{path}: component must have a non-empty 'id'")),
    };
    let layout = parse_layout(obj.get("layout"), path)?;
    let conditional = match obj.get("conditional") {
        Some(Json::Obj(c)) => match (c.get("hide"), c.len()) {
            // A conditional form-js adds keys to later is kept whole, never narrowed to `hide`.
            (Some(Json::Str(hide)), 1) => Some(FormConditional { hide: hide.clone() }),
            _ => None,
        },
        _ => None,
    };

    if form_element(type_).is_none() {
        return Ok(FormComponent {
            id,
            layout,
            conditional,
            extra_props: None,
            kind: ComponentKind::Unknown(FormUnknown {
                type_: type_.clone(),
                entries: obj.clone(),
            }),
        });
    }

    let mut p = Props::new(obj);
    let kind = parse_kind(type_, &mut p, path)?;
    if layout.is_some() {
        p.mark("layout");
    }
    let extra: Obj = obj
        .iter()
        .filter(|(k, _)| !p.has(k) && !(k.as_str() == "conditional" && conditional.is_some()))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    Ok(FormComponent {
        id,
        layout,
        conditional,
        extra_props: (!extra.is_empty()).then_some(extra),
        kind,
    })
}

fn parse_kind(type_: &str, p: &mut Props, path: &str) -> Res<ComponentKind> {
    Ok(match type_ {
        "text" => {
            let Some(text) = p.str("text") else {
                return err(format!("{path}: text component must have a 'text' string"));
            };
            ComponentKind::Text(TextProps {
                text,
                label: p.str("label"),
            })
        }
        "textfield" | "textarea" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            let props = FieldProps {
                label,
                key,
                validate: p.validate(path)?,
                default_value: p.str("defaultValue"),
            };
            if type_ == "textfield" {
                ComponentKind::Textfield(props)
            } else {
                ComponentKind::Textarea(props)
            }
        }
        "select" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Select(SelectProps {
                label,
                key,
                values: p.values(path)?,
                values_key: p.str("valuesKey"),
                validate: p.validate(path)?,
                searchable: p.bool("searchable"),
                default_value: p.str("defaultValue"),
            })
        }
        "radio" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Radio(RadioProps {
                label,
                key,
                values: p.values(path)?,
                values_expression: p.str("valuesExpression"),
                validate: p.validate(path)?,
                default_value: p.str("defaultValue"),
            })
        }
        "checkbox" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Checkbox(CheckboxProps {
                label,
                key,
                validate: p.validate(path)?,
                default_value: p.bool("defaultValue"),
            })
        }
        "checklist" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Checklist(ChecklistProps {
                label,
                key,
                values: p.values(path)?,
                values_expression: p.str("valuesExpression"),
                validate: p.validate(path)?,
            })
        }
        "group" => {
            let label = p.required_str("label", path, type_)?;
            let Some(Json::Arr(raw)) = p.obj.get("components") else {
                return err(format!("{path}: group must have a 'components' array"));
            };
            p.mark("components");
            ComponentKind::Group(GroupProps {
                label,
                components: parse_components(raw, &format!("{path}.components"))?,
                show_outline: p.bool("showOutline"),
            })
        }
        "number" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Number(NumberProps {
                label,
                key,
                validate: p.validate(path)?,
                default_value: p.num("defaultValue"),
            })
        }
        "datetime" => {
            p.mark("key");
            ComponentKind::Datetime(DatetimeProps {
                key: string_or_empty(p.obj.get("key")),
                subtype: p.str("subtype"),
                date_label: p.str("dateLabel"),
                time_label: p.str("timeLabel"),
                validate: p.validate(path)?,
            })
        }
        "button" => {
            let label = p.required_str("label", path, type_)?;
            ComponentKind::Button(ButtonProps {
                label,
                action: p.str("action"),
            })
        }
        "taglist" => {
            let label = p.required_str("label", path, type_)?;
            let key = p.required_str("key", path, type_)?;
            ComponentKind::Taglist(TaglistProps {
                label,
                key,
                values: p.values(path)?,
                values_key: p.str("valuesKey"),
                validate: p.validate(path)?,
            })
        }
        "table" => {
            let label = p.str("label");
            let data_source = p.str("dataSource");
            let row_count = p.num("rowCount");
            let columns = match p.obj.get("columns") {
                Some(Json::Arr(cols)) => {
                    p.mark("columns");
                    Some(
                        cols.iter()
                            .enumerate()
                            .map(|(i, c)| parse_column(c, path, i))
                            .collect::<Res<Vec<_>>>()?,
                    )
                }
                _ => None,
            };
            ComponentKind::Table(TableProps {
                label,
                data_source,
                row_count,
                columns,
            })
        }
        "image" => ComponentKind::Image(ImageProps {
            source: p.str("source"),
            alt: p.str("alt"),
        }),
        "dynamiclist" => {
            // Always present on the model, so a non-array input is dropped, not kept as extra.
            p.mark("components");
            let components = match p.obj.get("components") {
                Some(Json::Arr(raw)) => parse_components(raw, &format!("{path}.components"))?,
                _ => vec![],
            };
            ComponentKind::DynamicList(DynamicListProps {
                label: p.str("label"),
                path: p.str("path"),
                components,
                is_repeating: p.bool("isRepeating"),
                allow_add_remove: p.bool("allowAddRemove"),
                default_repetitions: p.num("defaultRepetitions"),
                show_outline: p.bool("showOutline"),
            })
        }
        "iframe" => {
            let label = p.str("label");
            let url = p.str("url");
            let height = p.num("height");
            let security = match p.obj.get("security") {
                Some(Json::Obj(sec)) => Some(bool_of(sec.get("allowScripts"))),
                // typeof [] === "object"
                Some(Json::Arr(_)) => Some(None),
                _ => None,
            };
            if security.is_some() {
                p.mark("security");
            }
            let security = security.map(|allow_scripts| FormIframeSecurity { allow_scripts });
            ComponentKind::Iframe(IframeProps {
                label,
                url,
                height,
                security,
            })
        }
        "separator" => ComponentKind::Separator,
        "spacer" => ComponentKind::Spacer(SpacerProps {
            height: p.num("height"),
        }),
        "documentPreview" => ComponentKind::DocumentPreview(DocumentPreviewProps {
            label: p.str("label"),
        }),
        "html" => ComponentKind::Html(HtmlProps {
            content: p.str("content"),
        }),
        "expression" => ComponentKind::Expression(ExpressionProps {
            key: p.str("key"),
            expression: p.str("expression"),
            compute_on: p.str("computeOn"),
        }),
        "filepicker" => ComponentKind::Filepicker(FilepickerProps {
            label: p.str("label"),
            key: p.str("key"),
            multiple: p.bool("multiple"),
        }),
        // Only reachable if the spec lists a type this parser has no arm for.
        other => return err(format!("{path}: no parser for component type '{other}'")),
    })
}

/// The entries of `o` the model did not take. A key whose value had the wrong type for its
/// modelled field is left out of `used`, so it stays here instead of vanishing.
fn leftover(o: &Obj, used: &[&str]) -> Option<Obj> {
    let rest: Obj = o
        .iter()
        .filter(|(k, _)| !used.contains(&k.as_str()))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    (!rest.is_empty()).then_some(rest)
}

fn parse_layout(raw: Option<&Json>, path: &str) -> Res<Option<FormLayout>> {
    match raw {
        None | Some(Json::Null) => Ok(None),
        Some(Json::Obj(o)) => {
            let mut used = vec![];
            let row = str_of(o.get("row"));
            if row.is_some() {
                used.push("row");
            }
            let columns = match o.get("columns") {
                Some(Json::Null) => Some(None),
                Some(Json::Num(n)) => Some(Some(JsNumber(*n))),
                _ => None,
            };
            if columns.is_some() {
                used.push("columns");
            }
            Ok(Some(FormLayout {
                row,
                columns,
                extra_props: leftover(o, &used),
            }))
        }
        Some(_) => err(format!("{path}.layout: must be an object")),
    }
}

fn parse_validation(raw: Option<&Json>, path: &str) -> Res<Option<FormValidation>> {
    match raw {
        None | Some(Json::Null) => Ok(None),
        Some(Json::Obj(o)) => {
            let mut used = vec![];
            let mut take = |key: &'static str, ok: bool| {
                if ok {
                    used.push(key);
                }
            };
            let required = bool_of(o.get("required"));
            take("required", required.is_some());
            let min_length = num_of(o.get("minLength"));
            take("minLength", min_length.is_some());
            let max_length = num_of(o.get("maxLength"));
            take("maxLength", max_length.is_some());
            let min = num_of(o.get("min"));
            take("min", min.is_some());
            let max = num_of(o.get("max"));
            take("max", max.is_some());
            let pattern = str_of(o.get("pattern"));
            take("pattern", pattern.is_some());
            let validation_type = str_of(o.get("validationType"));
            take("validationType", validation_type.is_some());
            Ok(Some(FormValidation {
                required,
                min_length,
                max_length,
                min,
                max,
                pattern,
                validation_type,
                extra_props: leftover(o, &used),
            }))
        }
        Some(_) => err(format!("{path}.validate: must be an object")),
    }
}

fn parse_values(raw: &[Json], path: &str) -> Res<Vec<FormValueOption>> {
    raw.iter()
        .enumerate()
        .map(|(i, v)| match v {
            Json::Obj(o) => Ok(FormValueOption {
                label: string_or_empty(o.get("label")),
                value: string_or_empty(o.get("value")),
                extra_props: leftover(o, &["label", "value"]),
            }),
            // typeof [] === "object": an array passes, with empty label and value.
            Json::Arr(_) => Ok(FormValueOption {
                label: String::new(),
                value: String::new(),
                extra_props: None,
            }),
            _ => err(format!("{path}.values[{i}]: must be an object")),
        })
        .collect()
}

fn parse_column(col: &Json, path: &str, i: usize) -> Res<FormTableColumn> {
    match col {
        // Reading `.label` off null would surface as a TypeError instead of bad input.
        Json::Null => err(format!("{path}.columns[{i}]: must be an object")),
        Json::Obj(o) => Ok(FormTableColumn {
            label: string_or_empty(o.get("label")),
            key: string_or_empty(o.get("key")),
        }),
        _ => Ok(FormTableColumn {
            label: String::new(),
            key: String::new(),
        }),
    }
}
