# Template metadata — Predefined configurations: `steps` and `presets` — Defining presets with `presets`

A preset is a reusable set of property values applied on top of the template's defaults. Leaf steps reference presets through `presetId`.

- `presets : Array<Object>` defines the available presets. Each preset has the following attributes:
  - `id : String` is a required key that uniquely identifies the preset. It is referenced by a step's `presetId`.
  - `properties : Object` is a required key that maps template property names to the values applied when the preset is selected. These values are applied on top of the template's default property values.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
