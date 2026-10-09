# Overview — Localization

Define the languages that can be used by Optimize.

| YAML path                     | Default value | Description                                                                                                                                                                            |
| ----------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| localization.availableLocales | ['en','de']   | All locales available in the Optimize Frontend. Note: for languages other than the default there must be a `<localeCode>.json` file available under ./config/localization. |
| localization.fallbackLocale   | 'en'          | The fallback locale used if there is a locale requested that is not available in availableLocales. The fallbackLocale is required to be present in localization.availableLocales.      |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
