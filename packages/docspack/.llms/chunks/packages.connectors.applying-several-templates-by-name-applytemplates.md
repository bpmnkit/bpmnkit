# @bpmnkit/connectors — Applying several templates by name — `applyTemplates`

`applyTemplates` is a batch wrapper over `applyTemplateToElement` for values written by hand,
such as a script or an agent's output. It runs the entries in order and returns every problem,
each naming its element:

```typescript
import { applyTemplates } from "@bpmnkit/connectors";
import { Bpmn } from "@bpmnkit/core";

const { definitions, problems } = applyTemplates(Bpmn.parse(xml), [
  {
    elementId: "SearchRecipes", // may sit inside a sub-process or ad-hoc sub-process
    template: "io.camunda.connectors.HttpJson.v2@18",
    values: {
      url: "https://dummyjson.com/recipes/search",
      retryCount: 3,
      resultExpression: `={
  toolCallResult: if count(response.body.recipes) > 0
    then response.body.recipes
    else "No result found."
}`,
    },
  },
]);
// problems: [] — or, for { retries: 3 }:
// { elementId: "SearchRecipes", key: "retries", suggestion: "retryCount", message: "…" }
```

- **`{ omitDefaults: true }`** (third argument, default `false`) leaves out any property whose value
  would only be the template's default: a key the entry does not give, on a property that is not
  Hidden and not required (`constraints.notEmpty`). The REST connector then carries no
  `followRedirects` or `documentReturnFormat.choice`, and an OpenAI agent no
  `provider.openai.api.responses.effort`. Hidden bindings (the task type) and the
  `zeebe:modelerTemplate` stamp are always written, and a value you pass is written even when it
  equals the default. Re-applying replaces the element's extensions, so an earlier apply's default
  does not survive. `applyTemplateToElement` and `applyElementTemplate` take the same option.
- **`template`** is a template id, `id@version`, an alias from `CONNECTOR_ALIASES` (`http`), or a
  template object. The catalog holds one version of each id, so a different `@version` is a
  problem naming the version available, and that element is left unchanged.
- **Keys are template property ids**, for example `retryCount` and `retryBackoff` on the REST
  connector, not the names of the extensions they write (`retries`). A key that does not match
  is reported with a `suggestion` when a property id or binding name is close; the rest of the
  entry is still applied.
- **A value the template switches off is reported.** Some properties apply only under a
  condition: the REST connector's `ignoreNullValues` exists only for POST, PUT and PATCH. A value
  for such a property is not written, and the problem names the condition it needs.
- **Properties you omit keep their template default.**
- **Values** may be strings, numbers or booleans; the last two are written in string form.
  Strings are written as given, so pass a real newline (`"\n\n"` in code, never the two
  characters backslash and `n`) for a paragraph break and keep a multi-line FEEL expression as
  one string.

---
Source: https://bpmnkit.com/docs/packages/connectors
