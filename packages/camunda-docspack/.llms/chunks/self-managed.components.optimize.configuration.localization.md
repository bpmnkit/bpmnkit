# Localization

Localization of Optimize.

To present a localized version of Optimize to users corresponding to their default browser language, Optimize provides the possibility to configure localizations.


## Default locale configuration

The distributions of Optimize contain the default localization files under `./config/localization/`.

The default localizations available are `en` for English and `de` for German. You can also find community maintained localizations in [this repository](https://github.com/camunda/camunda-optimize-translations).

Additionally, English is configured as the default `fallbackLocale`. Fallback in this case means whenever a user has a browser configured with a language that is not present in the `availableLocales` list, Optimize will use the `fallbackLocale`.

The default locale configuration in `./config/environment-config.yaml` looks like the following:

```
locales:
  availableLocales: ['en', 'de']
  fallbackLocale: 'en'
```

For more details on the configuration keys, refer to the [localization configuration section](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#localization).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/localization
