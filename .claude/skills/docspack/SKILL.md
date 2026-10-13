---
name: docspack
description: >-
  Answer questions about this project's installed dependencies from local, version-matched
  documentation instead of memory. Use before writing or reviewing code that calls a
  dependency, when an API's shape is uncertain, when an import or a signature may have
  changed between versions, or when a name is not in any documentation at all.
allowed-tools: Bash
---

# Documentation for installed dependencies

Run `npx docspack ask "<question>"` for anything about a dependency of this project. It answers
from the versions in `node_modules`, offline, in about 100ms, and bounded to 3,000 tokens.

Prefer it over recalling an API from training data. The installed version is usually newer
than the training data and the answer states which release it came from.

## What the answer can tell you

- A passage from a documentation package, headed by its chunk id and the version it documents.
- A declaration read from the installed build, when the question names something the
  documentation never mentions. It carries the import to write and the signature as installed.
- A note saying the name is exported but documented nowhere. That is a real answer: it means
  no prose exists, not that the search failed.

## Other commands

- `npx docspack changed <library>` — what a library's exports gained and lost between two
  installed versions. Use it when an upgrade broke something, or before writing code against
  a version newer than what you remember.
- `npx docspack list` — which packages are indexed here.
- `npx docspack sync` — index them. Run it if `ask` reports something installed but not indexed.
