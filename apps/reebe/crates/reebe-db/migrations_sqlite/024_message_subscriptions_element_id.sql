-- 007 gave message_subscriptions a NOT NULL element_id that the Postgres schema
-- does not have and the shared insert never fills, so every message catch event
-- failed to open its subscription on SQLite.
ALTER TABLE message_subscriptions DROP COLUMN element_id;
