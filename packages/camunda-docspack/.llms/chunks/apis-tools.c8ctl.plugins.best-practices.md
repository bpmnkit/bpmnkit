# Extend c8ctl with plugins — Best practices

- Use unique command names to avoid conflicts with built-in commands.
- Provide descriptions in `metadata.commands` so users discover your commands in `c8ctl help`.
- Keep descriptions concise and aim for a single line under 60 characters, starting with an imperative verb.
- Transpile TypeScript to JavaScript before publishing. The `c8ctl-plugin.js` entry point in `node_modules` must be JavaScript, because Node.js does not support type stripping in `node_modules`.
- Use `createClient()` from the runtime API to create SDK clients rather than importing the SDK directly. This ensures credentials and tenant resolution follow `c8ctl` conventions.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
