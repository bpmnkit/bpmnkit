# Installing the SDK to your project

# Installing the SDK to your project

**Caution: Technical Preview**
The PHP SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.


## Requirements

- PHP 8.2 or later
- [Composer](https://getcomposer.org/)
- `ext-json`; `ext-pcntl` is optional (enables forked job workers)


## Stable release (recommended for evaluation and integration testing)

While the SDK is a Technical Preview, use the stable release to evaluate it or in integration testing rather than in production. The stable version tracks the latest supported Camunda server release.

```bash
composer require camunda/orchestration-cluster-api
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/installing-the-sdk-to-your-project
