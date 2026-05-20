alter table tbl_subscription add column quartz boolean default true;
alter table tbl_subscription add column next_tier varchar(255) default null;
alter table tbl_subscription add column next_billing_cycle varchar(255) default null;
