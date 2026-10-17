# Template metadata — Engine compatibility: `engines`

- `engines : Object` is an optional key-value pair.
  - `camunda : SemanticVersion` is an optional key to define compatibility with Camunda Orchestration Cluster Versions.
  - `camundaDesktopModeler : SemanticVersion` is an optional key to define compatibility with Desktop Modeler versions.
  - `camundaWebModeler : SemanticVersion` is an optional key to define compatibility with Camunda Hub versions.

Define [template compatibility](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#compatibility) with execution platforms (Camunda Orchestration Cluster versions) and related components (such as Camunda Hub) using the `engines` key.

This key has a dictionary object as its value, where the execution platform names are the keys, and the [semantic version](https://semver.org/) ranges are the values.

For example, the following `engines` definition specifies that the template is compatible with Camunda 8.6 or higher.

```json
{
  ...,
  "engines": {
    "camunda": ">8.5"
  }
}
```

Compatibility is only validated if the platform version is provided by both the template and the modeler.
In the example below, the template is compatible with the specified versions of both Desktop and Camunda Hub, but it requires Camunda version 8.6 or higher for both:

```json
{
  ...,
  "engines": {
    "camunda": ">8.5",
    "camundaDesktopModeler": ">=5.30",
    "camundaWebModeler": "^8.5.5"
  }
}
```

You can also use this feature to explicitly specify a template's incompatibility with a platform. For instance, the following template is incompatible with all versions of Camunda Hub:

```json
{
  ...,
  "engines": {
    "camundaWebModeler": "0"
  }
}
```

If no `engines` are specified, a template is considered compatible with any execution platform version.

**Tip**
Review the [upstream documentation](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#overview) to learn more about template evolution and the template lifecycle.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
