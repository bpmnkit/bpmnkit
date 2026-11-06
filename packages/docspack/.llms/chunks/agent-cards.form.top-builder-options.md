# Form agent card — Top builder options

- `Form.create(id)` … `.build()` returns a `FormDefinition`; `Form.export(form)` gives the JSON.
- Fields take `(label, key, options)`: `textfield`, `textarea`, `select` (`values` or `valuesKey`), `checkbox`; `radio(label, key, values)`.
- `text(markdown)` is static text; `group(label, (g) => g.textfield(...))` nests fields.
- `options.validate`: `{ required, minLength, maxLength }`; `defaultValue`; `id` for a fixed component id.
- The builder stamps `8.10.0`; override with `.executionPlatformVersion("8.8.0")`.
- Read or change an existing file: `Form.parse(json)` → `form.components`.

---
Source: https://bpmnkit.com/docs/agent-cards/form
