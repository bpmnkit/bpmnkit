//! `exportForm`: `JSON.stringify(obj, null, 2)` over objects built in TS's key order.

use crate::json::{stringify_pretty, Json};
use crate::model::*;
use indexmap::IndexMap;

type Obj = IndexMap<String, Json>;

/// Serializes a [`FormDefinition`] to a JSON string, byte for byte as `exportForm` does.
pub fn export_form(form: &FormDefinition) -> String {
    let mut o = Obj::new();
    if let Some(v) = &form.execution_platform {
        o.insert("executionPlatform".into(), s(v));
    }
    if let Some(v) = &form.execution_platform_version {
        o.insert("executionPlatformVersion".into(), s(v));
    }
    if let Some(e) = &form.exporter {
        o.insert(
            "exporter".into(),
            obj([("name", s(&e.name)), ("version", s(&e.version))]),
        );
    }
    if let Some(v) = form.schema_version {
        o.insert("schemaVersion".into(), Json::Num(v.0));
    }
    o.insert("id".into(), s(&form.id));
    o.insert(
        "components".into(),
        Json::Arr(form.components.iter().map(component).collect()),
    );
    if let Some(v) = form.generated {
        o.insert("generated".into(), Json::Bool(v));
    }
    o.insert("type".into(), s(&form.type_));
    stringify_pretty(&Json::Obj(o))
}

fn s(v: &str) -> Json {
    Json::Str(v.to_owned())
}

fn obj<const N: usize>(entries: [(&str, Json); N]) -> Json {
    Json::Obj(
        entries
            .into_iter()
            .map(|(k, v)| (k.to_owned(), v))
            .collect(),
    )
}

fn opt_s(v: &Option<String>) -> Option<Json> {
    v.as_deref().map(s)
}

fn opt_b(v: Option<bool>) -> Option<Json> {
    v.map(Json::Bool)
}

fn opt_n(v: Option<crate::JsNumber>) -> Option<Json> {
    v.map(|n| Json::Num(n.0))
}

fn layout(l: &FormLayout) -> Json {
    let mut o = Obj::new();
    if let Some(row) = &l.row {
        o.insert("row".into(), s(row));
    }
    o.insert(
        "columns".into(),
        match l.columns {
            Some(Some(n)) => Json::Num(n.0),
            // An absent `columns` is written as null, the Camunda default.
            _ => Json::Null,
        },
    );
    Json::Obj(o)
}

fn validate(v: &Option<FormValidation>) -> Option<Json> {
    v.as_ref().map(|v| {
        let mut o = Obj::new();
        if let Some(b) = v.required {
            o.insert("required".into(), Json::Bool(b));
        }
        if let Some(n) = v.min_length {
            o.insert("minLength".into(), Json::Num(n.0));
        }
        if let Some(n) = v.max_length {
            o.insert("maxLength".into(), Json::Num(n.0));
        }
        Json::Obj(o)
    })
}

fn values(v: &Option<Vec<FormValueOption>>) -> Option<Json> {
    v.as_ref().map(|v| {
        Json::Arr(
            v.iter()
                .map(|o| obj([("label", s(&o.label)), ("value", s(&o.value))]))
                .collect(),
        )
    })
}

fn components(c: &[FormComponent]) -> Json {
    Json::Arr(c.iter().map(component).collect())
}

/// The fields a kind carries, and the order TS writes them in. A field missing from the order
/// is not written (TS drops `valuesExpression` of radio and checklist that way).
type Slots = Vec<(&'static str, Option<Json>)>;

fn kind_fields(c: &FormComponent) -> (Slots, &'static [&'static str]) {
    let common = |slots: &mut Slots| {
        slots.push(("type", Some(s(c.kind.type_name()))));
        slots.push(("id", Some(s(&c.id))));
        slots.push(("layout", c.layout.as_ref().map(layout)));
    };
    let mut f: Slots = vec![];
    common(&mut f);
    let order: &'static [&'static str] = match &c.kind {
        ComponentKind::Text(p) => {
            f.push(("text", Some(s(&p.text))));
            f.push(("label", opt_s(&p.label)));
            &["text", "label", "type", "layout", "id"]
        }
        ComponentKind::Textfield(p) | ComponentKind::Textarea(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("validate", validate(&p.validate)));
            f.push(("defaultValue", opt_s(&p.default_value)));
            &[
                "label",
                "type",
                "layout",
                "id",
                "key",
                "validate",
                "defaultValue",
            ]
        }
        ComponentKind::Select(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("values", values(&p.values)));
            f.push(("valuesKey", opt_s(&p.values_key)));
            f.push(("validate", validate(&p.validate)));
            f.push(("searchable", opt_b(p.searchable)));
            f.push(("defaultValue", opt_s(&p.default_value)));
            &[
                "label",
                "values",
                "valuesKey",
                "type",
                "layout",
                "id",
                "key",
                "validate",
                "searchable",
                "defaultValue",
            ]
        }
        ComponentKind::Radio(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("values", values(&p.values)));
            f.push(("validate", validate(&p.validate)));
            f.push(("defaultValue", opt_s(&p.default_value)));
            &[
                "label",
                "values",
                "type",
                "layout",
                "id",
                "key",
                "validate",
                "defaultValue",
            ]
        }
        ComponentKind::Checkbox(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("validate", validate(&p.validate)));
            f.push(("defaultValue", opt_b(p.default_value)));
            &[
                "label",
                "type",
                "id",
                "defaultValue",
                "validate",
                "key",
                "layout",
            ]
        }
        ComponentKind::Checklist(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("values", values(&p.values)));
            f.push(("validate", validate(&p.validate)));
            &["label", "values", "type", "layout", "id", "key", "validate"]
        }
        ComponentKind::Group(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("components", Some(components(&p.components))));
            f.push(("showOutline", opt_b(p.show_outline)));
            &["label", "components", "showOutline", "type", "layout", "id"]
        }
        ComponentKind::Number(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("validate", validate(&p.validate)));
            f.push(("defaultValue", opt_n(p.default_value)));
            &[
                "label",
                "type",
                "layout",
                "id",
                "key",
                "validate",
                "defaultValue",
            ]
        }
        ComponentKind::Datetime(p) => {
            f.push(("key", Some(s(&p.key))));
            f.push(("subtype", opt_s(&p.subtype)));
            f.push(("dateLabel", opt_s(&p.date_label)));
            f.push(("timeLabel", opt_s(&p.time_label)));
            f.push(("validate", validate(&p.validate)));
            &[
                "subtype",
                "dateLabel",
                "timeLabel",
                "type",
                "layout",
                "id",
                "key",
                "validate",
            ]
        }
        ComponentKind::Button(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("action", opt_s(&p.action)));
            &["label", "action", "type", "layout", "id"]
        }
        ComponentKind::Taglist(p) => {
            f.push(("label", Some(s(&p.label))));
            f.push(("key", Some(s(&p.key))));
            f.push(("values", values(&p.values)));
            f.push(("valuesKey", opt_s(&p.values_key)));
            f.push(("validate", validate(&p.validate)));
            &[
                "label",
                "values",
                "valuesKey",
                "type",
                "layout",
                "id",
                "key",
                "validate",
            ]
        }
        ComponentKind::Table(p) => {
            f.push(("label", opt_s(&p.label)));
            f.push(("dataSource", opt_s(&p.data_source)));
            f.push(("rowCount", opt_n(p.row_count)));
            f.push((
                "columns",
                p.columns.as_ref().map(|cols| {
                    Json::Arr(
                        cols.iter()
                            .map(|c| obj([("label", s(&c.label)), ("key", s(&c.key))]))
                            .collect(),
                    )
                }),
            ));
            &[
                "type",
                "id",
                "label",
                "dataSource",
                "rowCount",
                "columns",
                "layout",
            ]
        }
        ComponentKind::Image(p) => {
            f.push(("source", opt_s(&p.source)));
            f.push(("alt", opt_s(&p.alt)));
            &["source", "alt", "type", "layout", "id"]
        }
        ComponentKind::DynamicList(p) => {
            f.push(("label", opt_s(&p.label)));
            f.push(("components", Some(components(&p.components))));
            f.push(("path", opt_s(&p.path)));
            f.push(("isRepeating", opt_b(p.is_repeating)));
            f.push(("allowAddRemove", opt_b(p.allow_add_remove)));
            f.push(("defaultRepetitions", opt_n(p.default_repetitions)));
            f.push(("showOutline", opt_b(p.show_outline)));
            &[
                "type",
                "id",
                "label",
                "components",
                "path",
                "isRepeating",
                "allowAddRemove",
                "defaultRepetitions",
                "showOutline",
                "layout",
            ]
        }
        ComponentKind::Iframe(p) => {
            f.push(("label", opt_s(&p.label)));
            f.push(("url", opt_s(&p.url)));
            f.push(("height", opt_n(p.height)));
            f.push((
                "security",
                p.security.as_ref().map(|sec| {
                    let mut o = Obj::new();
                    if let Some(b) = sec.allow_scripts {
                        o.insert("allowScripts".into(), Json::Bool(b));
                    }
                    Json::Obj(o)
                }),
            ));
            &["type", "id", "label", "url", "height", "security", "layout"]
        }
        ComponentKind::Separator => &["type", "layout", "id"],
        ComponentKind::Spacer(p) => {
            f.push(("height", opt_n(p.height)));
            &["height", "type", "layout", "id"]
        }
        ComponentKind::DocumentPreview(p) => {
            f.push(("label", opt_s(&p.label)));
            &["label", "type", "layout", "id"]
        }
        ComponentKind::Html(p) => {
            f.push(("content", opt_s(&p.content)));
            &["content", "type", "layout", "id"]
        }
        ComponentKind::Expression(p) => {
            f.push(("key", opt_s(&p.key)));
            f.push(("expression", opt_s(&p.expression)));
            f.push(("computeOn", opt_s(&p.compute_on)));
            &["computeOn", "type", "layout", "id", "key", "expression"]
        }
        ComponentKind::Filepicker(p) => {
            f.push(("label", opt_s(&p.label)));
            f.push(("key", opt_s(&p.key)));
            f.push(("multiple", opt_b(p.multiple)));
            &["label", "type", "layout", "id", "key", "multiple"]
        }
        ComponentKind::Unknown(_) => &[],
    };
    (f, order)
}

fn component(c: &FormComponent) -> Json {
    let mut out = Obj::new();
    if let ComponentKind::Unknown(u) = &c.kind {
        // `{...component}`: the raw keys in their order, the parsed layout and conditional
        // standing in for the raw ones.
        for (k, v) in &u.entries {
            let v = match (k.as_str(), &c.layout, &c.conditional) {
                ("id", _, _) => s(&c.id),
                ("type", _, _) => s(&u.type_),
                ("layout", Some(l), _) => layout(l),
                ("conditional", _, Some(cond)) => obj([("hide", s(&cond.hide))]),
                _ => v.clone(),
            };
            out.insert(k.clone(), v);
        }
        if let (Some(l), false) = (&c.layout, out.contains_key("layout")) {
            out.insert("layout".into(), layout(l));
        }
    } else {
        let (slots, order) = kind_fields(c);
        for key in order {
            if let Some((_, Some(v))) = slots.iter().find(|(k, _)| k == key) {
                out.insert((*key).to_owned(), v.clone());
            }
        }
    }
    if let Some(cond) = &c.conditional {
        out.insert("conditional".into(), obj([("hide", s(&cond.hide))]));
    }
    for (k, v) in c.extra_props.iter().flatten() {
        if !out.contains_key(k) {
            out.insert(k.clone(), v.clone());
        }
    }
    Json::Obj(out)
}
