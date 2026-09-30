-- BPMN Kit Drop — describe-to-diagram: model calls per IP and hour.
-- The daily neuron budget is shared by everyone behind the beta code; without
-- a per-caller cap, one caller (or a leaked code) could spend it for all.
-- See doc/drop-ai-generate-analysis.md §21.
CREATE TABLE ai_generate_calls (
  ip_hash TEXT NOT NULL,
  hour    INTEGER NOT NULL,        -- floor(epoch_ms / 3600000)
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, hour)
);
