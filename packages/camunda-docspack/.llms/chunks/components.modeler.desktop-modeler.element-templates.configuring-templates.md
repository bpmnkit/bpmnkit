# Configuring templates

Learn about global and local templates, which are loaded by the modeler at application startup.

[Element templates](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates) are loaded by Desktop Modeler at application startup. Reloading it using `Cmd+R` or `Ctrl+R` reloads all templates. Templates are treated as global or local depending on their location in your file system.


## Global templates

For templates to be available for all diagrams store them in the `resources/element-templates` directory containing the Camunda Modeler executable. Alternatively, for element templates to be available across Camunda Modeler installations, you can store them in the `resources/element-templates` directory in the modeler's [user data directory](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths#user-data-directory).

### Examples

  
### windows

```
└── camunda-modeler-5.10.0-win-x64
    ├── Camunda Modeler.exe
    └── resources
        └── element-templates
            └── my-element-templates.json
```

  
  
### mac

**Note**

On macOS, the Camunda Modeler is a self-contained `.app` bundle, which makes it difficult to add files to its installation directory. Therefore, we recommend storing [global templates](#global-templates) in the [user data directory](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths#user-data-directory).

```
└── ~/Library/Application Support
        └── camunda-modeler
            └── resources
                └── element-templates
                    └── my-element-templates.json
```

  
  
### linux

```
└── camunda-modeler-5.10.0-linux-x64
    ├── camunda-modeler
    └── resources
        └── element-templates
            └── my-element-templates.json
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates
