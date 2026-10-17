# Configuring templates — Local templates

For element templates to only be available for specific diagrams, you can store them in a `.camunda/element-templates` directory in the diagrams parent directory or any of their parent directories.

### Example

```
├── diagram.bpmn
└── .camunda
    └── element-templates
        └── my-element-templates.json
```

Learn more about search paths [here](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates
