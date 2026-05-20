

select
    id, member_email, member_password,
    member_nickname, member_handle,
    member_phone, member_bio,
    member_region, member_status,
    member_role, push_enabled,
    website_url, birth_date, created_datetime,
    updated_datetime, last_login_at, member_name
from tbl_member
where member_phone = '01099139076' and member_password = '$2a$10$tq3cPX5qJaxrWcGaSBJYrutxACPQlfqWLY1QzNvNsoNdqIxhX6xkm'
and member_status = 'active';


select * from tbl_oauth;
select * from tbl_member;
select * from tbl_member_profile_file;
select * from tbl_file;
select * from tbl_business_member;
select * from tbl_category;
select * from tbl_member_category_rel;

alter table tbl_member add member_country varchar(255);
alter table tbl_member add member_language varchar(255);
alter table tbl_member drop website_url;
alter table tbl_member
alter column member_email drop not null;
ALTER TABLE tbl_member
ADD CONSTRAINT member_email_unique UNIQUE (member_email);

alter table tbl_member_category_rel add id bigint not null primary key ;
select * from tbl_member_category_rel;

create view vw_file_member as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    pf.member_id
from tbl_member_profile_file pf
         join tbl_file f on pf.id = f.id;


select *
from tbl_oauth o join tbl_member m on o.member_id = m.id;

create view vw_category_member as
select *
from tbl_member_category_rel mc join tbl_category c on mc.category_id = c.id;
select * from vw_category_member;

select * from tbl_category;
select * from tbl_member_category_rel;

drop view  vw_category_member;

drop table tbl_oauth;
drop type oauth_provider;

select * from tbl_post;
select * from tbl_post_product;
select * from vw_file_member;

alter table tbl_post add post_read_count int default 0;
update tbl_member set member_role = 'expert' where id = 78;
-- ============================================================
-- 마이페이지용 더미 데이터
-- - 게시물 탭에 보일 일반 게시글 2개
-- - 내 상품 탭에 보일 상품 게시글 2개
-- - 상품 카드에서 사용할 태그 / 이미지 / 파일 연결 데이터
--
-- 원칙
-- 1. 먼저 member_phone = '01099139076' 회원을 찾는다.
-- 2. 해당 회원이 없으면 테스트용 business 회원을 1명 생성한다.
-- 3. 같은 제목의 게시글이 이미 있으면 다시 넣지 않는다.
-- 4. 기존 데이터는 수정하지 않고, 필요한 데이터만 append 한다.
-- ============================================================



select
    id,
    member_email,
    member_phone,
    member_name,
    member_status,
    member_login_verified
from tbl_member
order by id desc;


insert into tbl_oauth (
    provider_id,
    provider,
    profile_url,
    member_id
) values (
             'kakao-restore-42',
             'kakao',
             null,
             35
         );





select * from tbl_subscription;
select * from tbl_estimation;
select * from tbl_post;

SELECT COUNT(*)
FROM tbl_member
WHERE member_status = 'active' AND id != 15;