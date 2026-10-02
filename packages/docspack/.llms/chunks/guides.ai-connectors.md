# Connectors in AI Generation

A generated diagram is only useful in Camunda 8 if its calls to outside systems are
configured connectors: the right template, the inputs it needs, credentials as secrets. BPMN
Kit does this in code wherever it can and asks a model only for what code cannot know. All
the connector data ships in the packages, so nothing is fetched at run time.


## Two passes

1. **The shape.** A model writes the process in the
   [line format](/docs/packages/core#parseprocesstexttext-and-createprocesstextstream): tasks,
   gateways, events. Each call to an outside system is its own service task.
2. **The connectors.** A second, small call configures them. Code picks the connector cards
   each task could use and sends only those. The model answers with `with` lines only, and
   code applies them.

The second pass is skipped without a model call when no task matches a connector. A pure
approval flow costs nothing extra.

---
Source: https://bpmnkit.com/docs/guides/ai-connectors
