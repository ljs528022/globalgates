-- ============================================
-- GlobalGates Community DB Migration
-- 기존 테이블에 컬럼/제약/인덱스 추가용
-- 여러 번 실행해도 안전 (IF NOT EXISTS 사용)
-- ============================================

-- ============================================
-- 1. enum 타입 생성
-- ============================================
-- community_status: 커뮤니티 소프트 삭제용 (active/inactive)
--   - 커뮤니티 삭제 시 DELETE 대신 inactive로 변경
--   - view_community_feed에서 active만 노출
do $$
begin
    if not exists (select 1 from pg_type where typname = 'community_status') then
        create type community_status as enum ('active', 'inactive');
    end if;
end $$;

-- community_member_role: 커뮤니티 내 권한 체계
--   - admin: 커뮤니티 생성자 (설정 변경, 추방, 역할 변경)
--   - moderator: admin이 지정한 중재자 (게시글/멤버 관리 위임)
--   - member: 일반 가입자 (게시글/댓글만 가능)
do $$
begin
    if not exists (select 1 from pg_type where typname = 'community_member_role') then
        create type community_member_role as enum ('admin', 'moderator', 'member');
    end if;
end $$;

-- ============================================
-- 2. tbl_community 컬럼 추가
-- ============================================
alter table if exists tbl_community
    add column if not exists creator_id bigint,
    add column if not exists community_status community_status default 'active',
    add column if not exists category_id bigint;

-- 기존 데이터 기본값 채우기
update tbl_community
set community_status = 'active'
where community_status is null;

update tbl_community
set creator_id = (select id from tbl_member order by id limit 1)
where creator_id is null
  and exists (select 1 from tbl_member);

-- FK 추가
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'fk_community_creator') then
        alter table tbl_community
            add constraint fk_community_creator
                foreign key (creator_id) references tbl_member(id);
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'fk_community_category') then
        alter table tbl_community
            add constraint fk_community_category
                foreign key (category_id) references tbl_category(id);
    end if;
end $$;

-- NOT NULL 제약 추가
do $$
begin
    if exists (select 1 from information_schema.columns where table_name = 'tbl_community' and column_name = 'community_status') then
        alter table tbl_community alter column community_status set default 'active';
        alter table tbl_community alter column community_status set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'tbl_community' and column_name = 'creator_id')
       and not exists (select 1 from tbl_community where creator_id is null) then
        alter table tbl_community alter column creator_id set not null;
    end if;
end $$;

-- ============================================
-- 3. tbl_community_member 컬럼 추가
-- ============================================
alter table if exists tbl_community_member
    add column if not exists member_role community_member_role default 'member',
    add column if not exists joined_at timestamp not null default now();

update tbl_community_member
set member_role = 'member'
where member_role is null;

alter table if exists tbl_community_member
    alter column member_role set default 'member',
    alter column member_role set not null;

-- ============================================
-- 4. tbl_post 컬럼 추가 (커뮤니티 연결)
-- ============================================
alter table if exists tbl_post
    add column if not exists community_id bigint;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'fk_post_community') then
        alter table tbl_post
            add constraint fk_post_community
                foreign key (community_id) references tbl_community(id);
    end if;
end $$;

-- ============================================
-- 5. tbl_community_file 테이블 생성 (커버 이미지)
-- ============================================
create table if not exists tbl_community_file (
    id bigint primary key,
    community_id bigint not null,
    constraint fk_community_file_file foreign key (id) references tbl_file(id),
    constraint fk_community_file_community foreign key (community_id) references tbl_community(id)
);

-- ============================================
-- 6. 인덱스 추가
-- ============================================
create index if not exists idx_community_member_member_id
    on tbl_community_member (member_id);

create index if not exists idx_post_community_id
    on tbl_post (community_id);

create index if not exists idx_community_file_community_id
    on tbl_community_file (community_id);

-- ============================================
-- 7. 뷰 생성/갱신
-- ============================================
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

-- 게시글 피드용 view_post_feed는 views.sql에서 통합 관리
