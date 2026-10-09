# Localization — Custom locale configuration

Custom locales can be added by creating a locale file under `./config/localization/` and adding it to the `availableLocales` configuration.

**Note**
Configuring a custom locale means you have to maintain it yourself and update it in the context of an Optimize upgrade.

There is currently no changelog of new localization entries available, and it is required that each localization file contains an entry for each key used by Optimize.

As an example, a custom localization can be created by making a copy of the `./config/localization/en.json` named `/config/localization/es.json` and adding it to the available locales in `./config/environment-config.yaml`

```
locales:
  availableLocales: ['en', 'de', 'es']
  fallbackLocale: 'en'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/localization
