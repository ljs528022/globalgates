alter table public.tbl_subscription
    add column if not exists billing_key varchar(255);

alter table public.tbl_subscription
    add column if not exists amount bigint;

alter table tbl_subscription drop column next_tier;
alter table tbl_subscription drop column next_billing_cycle;
alter table public.tbl_subscription
    add column if not exists amount bigint;