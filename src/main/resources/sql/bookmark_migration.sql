-- 북마크 중복 방지 unique 제약 추가
-- 실행 전 중복 데이터 확인:
-- select member_id, post_id, count(*) from tbl_bookmark group by member_id, post_id having count(*) > 1;

-- 중복 데이터가 있으면 먼저 정리:
-- delete from tbl_bookmark a using tbl_bookmark b
-- where a.id > b.id and a.member_id = b.member_id and a.post_id = b.post_id;


-- [기존] 회원+게시물 단위 중복 방지 (폴더 간 중복 불가)
-- alter table tbl_bookmark add constraint uq_bookmark_member_post unique (member_id, post_id);

-- [변경] 회원+게시물+폴더 단위 중복 방지 (다른 폴더에는 같은 게시물 허용)
-- 실행 순서: 1) 기존 제약 삭제 → 2) 새 제약 추가
alter table tbl_bookmark drop constraint if exists uq_bookmark_member_post;
alter table tbl_bookmark add constraint uq_bookmark_member_post_folder unique (member_id, post_id, folder_id);
select * from tbl_member;
select * from tbl_follow;
select * from tbl_bookmark;
select * from tbl_post;
select * from tbl_bookmark_folder;
select * from tbl_post;

UPDATE tbl_member
SET member_role = 'admin', updated_datetime = now()
WHERE member_email = 'tedwin1@kakao.com';

SELECT
    (SELECT COUNT(*) FROM tbl_member WHERE member_status='active')
                                                                                     AS a_active,
    (SELECT COUNT(*) FROM tbl_member WHERE member_status='active' AND
        push_enabled)    AS b_push,
    (SELECT COUNT(*) FROM tbl_member WHERE member_status='active' AND
        push_enabled
                                       AND member_email IS NOT NULL AND member_email <> '')
                                                                                     AS c_email,
    (SELECT COUNT(*) FROM tbl_post_like WHERE created_datetime >= NOW() -
                                                                  INTERVAL '7 days') AS d_recent_likes;