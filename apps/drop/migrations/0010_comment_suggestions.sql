-- BPMN Kit Drop — suggested changes on review threads.
--
-- An AI change is private to whoever asked for it until they apply it. A
-- suggestion is the other choice: the proposal is put on the threads it
-- answers, so the reviewers can look at it and talk about it before someone
-- with the edit baton applies it.
--
-- What is stored is the change script and the alias map it resolves against,
-- never a description of it: every reader's preview is worked out again from
-- the script, so nothing a browser sent can misdescribe what Apply would do.
-- `base_hash` is the semantic hash of the diagram it was worked out on, so a
-- reader can be told when the diagram has changed since.
-- See doc/drop-ai-feedback-edits-analysis.md §16.

CREATE TABLE comment_suggestions (
  id          TEXT PRIMARY KEY,               -- base58, 12 chars
  drop_id     TEXT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  thread_ids  TEXT NOT NULL,                  -- JSON array of the threads it answers, in order
  script      TEXT NOT NULL,                  -- the change script, filtered
  aliases     TEXT NOT NULL,                  -- JSON: written id → element id
  base_hash   TEXT NOT NULL,                  -- semanticHash of the diagram it was made on
  author_name TEXT NOT NULL,
  author_hash TEXT NOT NULL,                  -- as comments.author_hash
  created_at  INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',   -- open | applied | withdrawn
  closed_at   INTEGER,
  closed_by   TEXT
);

CREATE INDEX idx_comment_suggestions_drop ON comment_suggestions (drop_id, created_at);
