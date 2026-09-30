-- BPMN Kit Drop — describe-to-diagram (closed beta, same gate as the AI review).
-- See doc/drop-ai-generate-analysis.md §6.

-- The model's answer, keyed by a hash of the model, the system prompt and the
-- normalised description — the same request never spends neurons twice, and a
-- prompt change starts a fresh cache instead of serving answers to the old one.
CREATE TABLE ai_generations (
  request_hash TEXT PRIMARY KEY,
  model        TEXT NOT NULL,
  text         TEXT NOT NULL,      -- the model's output in the line format
  neurons_est  INTEGER,
  created_at   INTEGER NOT NULL
);
