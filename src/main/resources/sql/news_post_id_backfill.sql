-- 어드민 속보 뉴스 메인 피드 노출 백필
-- 배경: AdminNewsService.createAdminNews가 tbl_post 시드 게시글을 만들지 않고
--       tbl_news.post_id도 비워두던 버그로, 기존 emergency 뉴스 행이 메인 피드의
--       view_post_feed JOIN(n.post_id = v.id) 조건에 매칭되지 않아 노출되지 않는다.
-- 동작: post_id가 NULL인 emergency 뉴스 각각에 대해
--       1) admin_id를 작성자로 tbl_post 시드 게시글 INSERT
--       2) 발급된 post.id로 해당 tbl_news 행의 post_id UPDATE
-- 멱등성: WHERE post_id IS NULL 필터로 재실행해도 중복 시드 게시글이 생기지 않는다.
-- 범위: news_type = 'emergency'만 대상. general 뉴스는 메인 피드에서 명시적으로
--       제외되므로(필터: not exists ... news_type = 'general') 시드 불필요.

BEGIN;

DO $$
DECLARE
    rec RECORD;
    new_post_id BIGINT;
    backfilled INT := 0;
BEGIN
    FOR rec IN
        SELECT id, admin_id, news_title, news_content
        FROM tbl_news
        WHERE post_id IS NULL
          AND news_type = 'emergency'
        ORDER BY id
    LOOP
        INSERT INTO tbl_post (member_id, post_status, title, content)
        VALUES (rec.admin_id, 'active'::post_status, rec.news_title, rec.news_content)
        RETURNING id INTO new_post_id;

        UPDATE tbl_news SET post_id = new_post_id WHERE id = rec.id;

        backfilled := backfilled + 1;
    END LOOP;

    RAISE NOTICE 'backfilled % emergency news row(s)', backfilled;
END $$;

COMMIT;
