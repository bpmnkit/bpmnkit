# Search paths — User data directory

The `camunda-modeler/resources` directory relative to the per-user application data directory, which by default points to:

- `%APPDATA%` on [Windows](https://www.pcworld.com/article/2690709/whats-in-the-hidden-windows-appdata-folder-and-how-to-find-it-if-you-need-it.html)
- `$XDG_CONFIG_HOME` or `~/.config` on [Linux](https://wiki.archlinux.org/index.php/XDG_user_directories)
- `~/Library/Application Support` on macOS

In our documentation we refer to it as `{USER_DATA_DIRECTORY}`.

Resources in the user data directory will be found by all Camunda Modeler instances.

### Examples

  
### windows

```
└── %APPDATA%
    └── Roaming
        └── camunda-modeler
            └── resources
                ├── element-templates
                |   └── my-element-templates.json
                └── plugins
                    └── my-plugin
                        └── index.js
```

  
  
### mac

```
└── ~/Library/Application Support
        └── camunda-modeler
            └── resources
                ├── element-templates
                |   └── my-element-templates.json
                └── plugins
                    └── my-plugin
                        └── index.js
```

  
  
### linux

```
└── ~/.config
    └── camunda-modeler
        └── resources
            ├── element-templates
            |   └── my-element-templates.json
            └── plugins
                └── my-plugin
                    └── index.js
```

  

It is possible to change the user data directory using the `--user-data-dir` option via when starting Camunda Modeler from the command line. Refer to the [flags documentation](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths/flags) on how to configure the application with a flags file.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/search-paths/search-paths
