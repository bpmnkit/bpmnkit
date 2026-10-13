---
name: docspack-repo
description: >-
  Find where something lives in this repository, or what its own docs say, without reading
  whole files. Use before opening files to locate the code behind a behaviour, a function
  whose name you do not know, or a module's entry points, and before answering a question
  about how this repository is designed.
allowed-tools: Bash, Read, Grep
---

# Finding things in this repository

`npx docspack index --repo` keeps two indexes of this repository, rebuilt when a session
starts. A question costs a few hundred tokens; reading the wrong file costs thousands.

## Two indexes, asked separately

- `repo-code` is a map of the code: one entry per top-level declaration, with its
  `file:line`, its signature and its doc comment, never its body. There is one entry per
  `package.json` as well.
- `repo-docs` is every Markdown file git tracks: READMEs, `docs/`, design notes.

Ask the one the question is about. Asked together, the prose outranks the code.

```bash
npx docspack recall --name repo-code "where are requests forwarded to the backend"
npx docspack recall --name repo-docs "why is the cache keyed by tenant"
```

## Reading an answer

A `repo-code` answer is headed by the declaration and where it is:

```
# proxyMiddleware (proxy middleware) — packages/server/src/proxy.ts:91
```

Read that range of the file, a few dozen lines around the line, not the whole file. The
words in brackets are the name split up, which is how a question with no name in it finds
it. Describe what the code does in plain words: the answer is ranked on the words in the
name, the signature and the doc comment.

## When not to use it

- You know the name: `grep -n` for it is exact and costs nothing.
- You are about to edit: the entry is a pointer. Line numbers move; the file is the truth.

## When the index is out of date

An answer that starts with `NOTE: the corpus is out of date` names files that changed since
the index was built. Run `npx docspack index --repo` and ask again. It takes about a second, and
does nothing when nothing changed. Run it too if `recall` says nothing has been indexed.
