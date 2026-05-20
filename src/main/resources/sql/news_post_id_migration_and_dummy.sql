-- 메인피드 emergency 뉴스 카드 살리기
-- 1) tbl_news.post_id 컬럼 + FK
-- 2) emergency 뉴스용 시드 게시글 + 그 게시글에 연결된 emergency 뉴스 2건

BEGIN;

-- 1) 컬럼/제약 추가 (idempotent)
ALTER TABLE tbl_news ADD COLUMN IF NOT EXISTS post_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_news_post'
    ) THEN
        ALTER TABLE tbl_news
            ADD CONSTRAINT fk_news_post
            FOREIGN KEY (post_id) REFERENCES tbl_post(id);
    END IF;
END $$;

-- 2) 시드 게시글 #1 (속보 1)
INSERT INTO tbl_post (member_id, post_status, title, content)
SELECT id, 'active'::post_status,
       '[속보] KOSPI 8% 하락',
       '서킷브레이커 발동. 반도체 종목 급락.'
FROM tbl_member
WHERE member_email = 'kim@test.com'
  AND NOT EXISTS (
      SELECT 1 FROM tbl_post WHERE title = '[속보] KOSPI 8% 하락'
  );

-- 3) emergency 뉴스 #1 + post_id 연결
INSERT INTO tbl_news (admin_id, news_title, news_content, news_source_url,
                     news_category, news_type, post_id)
SELECT
    (SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'),
    '[속보] KOSPI 8% 하락',
    '서킷브레이커 발동. 반도체 종목 급락 중.',
    'https://example.com/news/breaking-1',
    'market'::news_category_type,
    'emergency'::news_type,
    (SELECT id FROM tbl_post WHERE title = '[속보] KOSPI 8% 하락' ORDER BY id DESC LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_news WHERE news_title = '[속보] KOSPI 8% 하락'
);

-- 4) 시드 게시글 #2 (속보 2)
INSERT INTO tbl_post (member_id, post_status, title, content)
SELECT id, 'active'::post_status,
       '[속보] 원달러 환율 1,500원 임박',
       '강달러와 유가 상승으로 원달러 환율 1,497원 도달.'
FROM tbl_member
WHERE member_email = 'kim@test.com'
  AND NOT EXISTS (
      SELECT 1 FROM tbl_post WHERE title = '[속보] 원달러 환율 1,500원 임박'
  );

-- 5) emergency 뉴스 #2 + post_id 연결
INSERT INTO tbl_news (admin_id, news_title, news_content, news_source_url,
                     news_category, news_type, post_id)
SELECT
    (SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'),
    '[속보] 원달러 환율 1,500원 임박',
    '강달러와 유가 상승으로 원달러 환율 1,497원 도달, 1,500원 돌파 위협.',
    'https://example.com/news/breaking-2',
    'market'::news_category_type,
    'emergency'::news_type,
    (SELECT id FROM tbl_post WHERE title = '[속보] 원달러 환율 1,500원 임박' ORDER BY id DESC LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_news WHERE news_title = '[속보] 원달러 환율 1,500원 임박'
);

COMMIT;
