-- BPMN Kit Drop — a comment on several elements at once.
--
-- "These two steps should be one" is about two elements, and anchoring it to
-- one of them hides half of what it says. `element_id` stays the first anchor,
-- so a marker, an older page and every existing row keep working;
-- `element_ids` lists all of them, as JSON, when there is more than one.
-- See doc/drop-ai-feedback-edits-analysis.md §15.
ALTER TABLE comments ADD COLUMN element_ids TEXT;
