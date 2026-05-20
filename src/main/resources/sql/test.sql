select * from tbl_post_hashtag;

select * from tbl_post_hashtag_rel;

select * from tbl_post;
select * from tbl_post where id >= 300;

select * from tbl_post where id=293;

select * from tbl_block;

delete from tbl_block where blocked_id = 85;
delete from tbl_block where blocked_id = 41;

delete from tbl_report where reporter_id = 87;
delete from tbl_report where reporter_id = 88;
delete from tbl_report where reporter_id = 41;

select * from tbl_mention;

select * from tbl_notification;

select * from tbl_report;

select * from tbl_post_product;

select * from tbl_news;

select * from tbl_member where member_role='expert';
select * from tbl_member where member_role='admin';

select * from tbl_member_category_rel;

select * from tbl_category;

select * from tbl_follow;

select * from tbl_advertisement;

select * from tbl_ad_file;

select * from tbl_file;

select * from tbl_advertisement where id=12008;
select * from tbl_advertisement where id=12009;

select * from tbl_ad_tag where ad_id=12008;
select * from tbl_ad_tag where ad_id=12009;

select * from tbl_ad_file;

select * from tbl_tag_for_ad;

select * from tbl_ad_tag;

select * from tbl_ad_file;

select * from tbl_payment_advertisement;

select * from tbl_conversation;

select * from tbl_video_session;

select * from tbl_video_recoding;

update tbl_member set member_role='admin' where id=41;

select * from tbl_file;

select * from tbl_post_file;

select * from tbl_file;

select * from tbl_block;

select * from tbl_category;

select * from tbl_member_category_rel;

select * from tbl_member;

select * from tbl_follow;

select * from tbl_bookmark;

select * from tbl_subscription;

select * from tbl_payment_subscribe;

select * from tbl_badge;

select * from tbl_post_like;

select * from tbl_search_history;

select * from tbl_conversation;

select * from tbl_meeting;

alter table tbl_subscription add column quartz boolean default true;

update tbl_subscription set quartz = false, expires_at = '2026-03-30' where member_id = 41;
update tbl_subscription set expires_at = '2026-03-30' where member_id = 41;

-- update tbl_subscription set tier = 'free' where member_id = 41;
delete from tbl_badge where member_id = 41;
delete from tbl_payment_subscribe where member_id = 41;
delete from tbl_subscription where member_id = 41;

select count(*) from tbl_advertisement;