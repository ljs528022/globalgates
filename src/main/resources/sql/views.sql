-- 광고 이미지 조회하는 view
create view vw_file_advertisement as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    af.ad_id
from tbl_ad_file af
join tbl_file f on af.id = f.id;

-- 녹음 파일 조회하는 view
create view vw_file_recoding as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime
from tbl_video_recoding vr
join tbl_file f on vr.id = f.id;


drop view if exists view_post_feed;

-- 게시물 관련된 모든 정보 조회하는 view
create view view_post_feed as
select p.id, p.member_id, p.post_status,
       p.title as post_title, p.content as post_content,
       p.location, p.reply_post_id, p.created_datetime, p.updated_datetime,
       m.member_name as member_nickname, m.member_handle,
       (select f.file_name
        from tbl_member_profile_file mpf
                 join tbl_file f on mpf.id = f.id
        where mpf.member_id = p.member_id
          and mpf.profile_image_type = 'profile'
        limit 1) as member_profile_file_name,
       (select count(*)
        from tbl_post_like pl
        where pl.post_id = p.id) as like_count,
       (select count(*)
        from tbl_post rp
        where rp.reply_post_id = p.id and rp.post_status = 'active') as reply_count,
       p.post_read_count,
       bg.badge_type,
       p.community_id,
       c.community_name,
       rel.product_post_id as product_id,
       pp.product_price    as product_price,
       pp.product_stock    as product_stock,
       ap.title            as product_title,
       ap.content          as product_content,
       (select string_agg(h.tag_name, ',' order by r.id)
        from tbl_post_hashtag h
                 join tbl_post_hashtag_rel r on h.id = r.hashtag_id
        where r.post_id = rel.product_post_id) as product_hashtags,
       (select f.file_path
        from tbl_post_file pf
                 join tbl_file f on pf.file_id = f.id
        where pf.post_id = rel.product_post_id
        order by f.id asc
        limit 1)                               as product_image
from tbl_post p
         join tbl_member m on p.member_id = m.id
         left join tbl_badge bg on bg.member_id = p.member_id
         left join tbl_community c on p.community_id = c.id
         left join tbl_post_product_rel rel on rel.post_id = p.id
         left join tbl_post_product pp on pp.id = rel.product_post_id
         left join tbl_post ap on ap.id = rel.product_post_id
where p.post_status = 'active'
  and p.reply_post_id is null;


-- 유저 프로필 사진 조회하는 view
create view vw_file_member as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    pf.member_id
from tbl_member_profile_file pf
         join tbl_file f on pf.id = f.id;

-- 조회자(member_id) 기준으로 상대방 정보 + 개인 설정을 한 행에 보여주는 뷰
create view v_my_chat as
select
    c.id              as conversation_id,
    rel.sender_id     as member_id,
    rel.invited_id    as partner_id,
    coalesce(partner.member_nickname, partner.member_name) as partner_name,
    partner.member_handle as partner_handle,
    cs.alias,
    coalesce(cs.alias, partner.member_nickname, partner.member_name) as display_name,
    cs.last_read_message_id as my_last_read,
    cs_partner.last_read_message_id as partner_last_read,
    coalesce(cs.is_muted, false) as is_muted,
    coalesce(cs.is_deleted, false) as is_deleted,
    c.created_datetime,
    c.updated_datetime
from tbl_conversation c
         join tbl_conversation_member_rel rel on c.id = rel.conversation_id
         join tbl_member partner on partner.id = rel.invited_id
         left join tbl_conversation_setting cs
                   on cs.conversation_id = c.id and cs.member_id = rel.sender_id
         left join tbl_conversation_setting cs_partner
                   on cs_partner.conversation_id = c.id and cs_partner.member_id = rel.invited_id
union all
select
    c.id              as conversation_id,
    rel.invited_id    as member_id,
    rel.sender_id     as partner_id,
    coalesce(partner.member_nickname, partner.member_name) as partner_name,
    partner.member_handle as partner_handle,
    cs.alias,
    coalesce(cs.alias, partner.member_nickname, partner.member_name) as display_name,
    cs.last_read_message_id as my_last_read,
    cs_partner.last_read_message_id as partner_last_read,
    coalesce(cs.is_muted, false) as is_muted,
    coalesce(cs.is_deleted, false) as is_deleted,
    c.created_datetime,
    c.updated_datetime
from tbl_conversation c
         join tbl_conversation_member_rel rel on c.id = rel.conversation_id
         join tbl_member partner on partner.id = rel.sender_id
         left join tbl_conversation_setting cs
                   on cs.conversation_id = c.id and cs.member_id = rel.invited_id
         left join tbl_conversation_setting cs_partner
                   on cs_partner.conversation_id = c.id and cs_partner.member_id = rel.sender_id;

-- 거래처 등록 목록 페이지에서 거래저(사업자)를 조회하는 view
create view vw_inquiry_member as
select
    m.id,
    m.member_nickname,
    m.member_handle,
    m.member_bio,
    m.member_status,
    m.member_role,
    tf.file_path,
    (
        select c.category_name
        from tbl_member_category_rel mcr
                 join tbl_category c on c.id = mcr.category_id
        where mcr.member_id = m.id
        limit 1
    ) as category_name,
    (
        select m2.member_handle
        from tbl_follow f2
                 join tbl_member m2 on m2.id = f2.following_id
        where f2.follower_id = m.id
          and m2.member_role = 'expert'
        order by (
                     select count(*) from tbl_follow f3
                     where f3.following_id = m2.id
                 ) desc
        limit 1
    ) as expert_handle
from tbl_member m
left join tbl_member_profile_file mpf on mpf.member_id = m.id
left join tbl_file tf on tf.id = mpf.id;

-- 커뮤니티 목록용 (멤버수, 게시글수, 커버이미지 포함)
create or replace view view_community_feed as
select c.id,
       c.community_name,
       c.description,
       c.creator_id,
       c.community_status,
       c.category_id,
       cat.category_name,
       c.created_datetime,
       c.updated_datetime,
       (select count(*)
        from tbl_community_member cm
        where cm.community_id = c.id) as member_count,
       (select count(*)
        from tbl_post p
        where p.community_id = c.id
          and p.post_status = 'active'
          and p.reply_post_id is null) as post_count,
       (select f.file_path
        from tbl_community_file cf
                 join tbl_file f on cf.id = f.id
        where cf.community_id = c.id
        limit 1) as cover_file_path
from tbl_community c
         left join tbl_category cat on c.category_id = cat.id
where c.community_status = 'active';