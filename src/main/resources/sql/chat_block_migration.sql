-- Add block tracking columns to tbl_conversation_setting
alter table tbl_conversation_setting add column if not exists blocked_after_message_id bigint default null;
alter table tbl_conversation_setting add column if not exists block_released_message_id bigint default null;

