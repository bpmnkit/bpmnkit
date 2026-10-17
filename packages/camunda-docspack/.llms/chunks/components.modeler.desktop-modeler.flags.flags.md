# Flags

Flags allow you to control the availability of certain features within Desktop Modeler.

Flags allow you to control the availability of certain features within Desktop Modeler. Learn which flags [are available](#available-flags) and how to [configure them](#configuration).


## Configuration

You may configure flags in a `flags.json` file or pass them via CLI.

### Configuration via `flags.json`

**Note**
Configuration changes via `flags.json` will only take effect once you restart the application.

Place a `flags.json` file inside the `resources` folder of your local [`{USER_DATA}`](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/search-paths#user-data-directory) or [`{APP_DATA_DIRECTORY}`](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/search-paths#app-data-directory) directory to persist them.

### Configuration via command line

Pass flags via the command line when starting the application.

```plain
"Camunda Modeler.exe" --disable-plugins
```

```plain
camunda-modeler --disable-plugins
```

```plain
camunda-modeler --disable-plugins
```

Flags passed as command line arguments take precedence over those configured via a configuration file.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/flags
