# Search paths

Features like element templates and plugins allow you to add your own resources to Desktop Modeler.

Features like element templates and plugins allow you to add your own resources to Desktop Modeler. For these resources to be found, they have to be in one of two directories depending on how local or global you want them to be.


## App data directory

The `resources` directory relative to the directory containing the Camunda Modeler executable file. In our documentation we refer to it as `{APP_DATA_DIRECTORY}`.

Resources in the app data directory will be found by any local Camunda Modeler instance.

### Examples

  
### windows

```
└── camunda-modeler-5.10.0-win-x64
    ├── Camunda Modeler.exe
    └── resources
        ├── element-templates
        |   └── my-element-templates.json
        └── plugins
            └── my-plugin
                └── index.js
```

  
  
### mac

**Note**

On macOS, the Camunda Modeler is a self-contained `.app` bundle, which makes it difficult to add files to its installation directory. Therefore, we recommend using the [user data directory](#user-data-directory) instead.

  
### linux

```
└── camunda-modeler-5.10.0-linux-x64
    ├── camunda-modeler
    └── resources
        ├── element-templates
        |   └── my-element-templates.json
        └── plugins
            └── my-plugin
                └── index.js
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths/search-paths
