-- 견적 요청 테스트용 상품 더미 데이터
-- tbl_post → tbl_post_product 두 단계로 1:1 insert.
-- product_category_id는 tbl_category에서 카테고리명으로 조회해 매핑한다.
--
-- 사전 조건:
--   1) tbl_member 에 아래 이메일 회원이 존재
--      (member.sql / dummy_data.sql / friends_dummy_data.sql / estimation_location_migration.sql)
--   2) tbl_category 에 아래 카테고리명이 존재 (category_data.sql)
--   3) tbl_post_product.product_category_id 컬럼이 존재 (post_product_category_migration.sql)
--
-- ⚠️ 재실행 주의:
--   tbl_post.id 가 auto-generated 라 두 번 실행하면 같은 title 의 post 가 중복 생성되고
--   그 다음 tbl_post_product join 시 같은 id 에 중복 insert 가 시도되어 PK 충돌이 납니다.
--   재실행 전에는 파일 하단의 cleanup 블록을 먼저 돌리세요.

-- ============================================================
-- 0. 의존 회원 보강 (idempotent)
--    estimation_location_migration.sql 에서 생성하는 expert_a@test.com 이 없으면 같이 만들어둔다.
--    이미 있으면 스킵 (where not exists 가드).
-- ============================================================
insert into tbl_member (
    member_name, member_email, member_password,
    member_nickname, member_handle, member_phone,
    member_bio, member_region, member_role
)
select '전문가A', 'expert_a@test.com',
       '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
       '전문가A', '@expert_a', '01011112222',
       '견적 테스트용 전문가 계정', '서울', 'expert'
where not exists (select 1 from tbl_member where member_email = 'expert_a@test.com');

-- ============================================================
-- 1. tbl_post (상품 본체)
-- ============================================================
insert into tbl_post (member_id, post_status, title, content)
values
    ((select id from tbl_member where member_email = 'expert_a@test.com'),
     'active'::post_status, '프리미엄 원두 커피 1kg',
     '에티오피아 예가체프 싱글오리진. 미디엄 로스팅, 산미와 과일향이 풍부합니다. MOQ 협의 가능.'),
    ((select id from tbl_member where member_email = 'expert_a@test.com'),
     'active'::post_status, '스테인리스 텀블러 500ml',
     '이중 진공 단열 구조. 보온 12시간/보냉 24시간. BPA Free. OEM 패키징 가능.'),
    ((select id from tbl_member where member_email = 'expert_a@test.com'),
     'active'::post_status, '친환경 패키지 박스 50세트',
     '재활용 종이 100%. 식품/화장품 포장 가능. 인쇄 옵션 별도 견적.'),

    ((select id from tbl_member where member_email = 'lee@test.com'),
     'active'::post_status, '한국산 김 세트 12개입',
     '전남 완도 직송. 조미김/돌김/김자반 3종 혼합. 명절 선물용. EU/미주 수출 실적 보유.'),
    ((select id from tbl_member where member_email = 'lee@test.com'),
     'active'::post_status, '국산 콩 된장 1kg',
     '국내산 콩 100%. 3년 숙성. 무방부제. 동남아 시장 인증 가능.'),

    ((select id from tbl_member where member_email = 'choi@test.com'),
     'active'::post_status, 'HS코드 분류 컨설팅 패키지',
     '품목별 HS코드 분류 + 관세율 분석 + FTA 원산지 검증 보고서 일괄 제공. 건당 10품목 기준.'),

    ((select id from tbl_member where member_email = 'kim@test.com'),
     'active'::post_status, '농산물 공동구매 박스 10kg',
     '제주산 감귤 + 제주산 양파 혼합. 매월 정기 발송 가능. 단체 주문 우선.');

-- ============================================================
-- 2. tbl_post_product (가격/수량/카테고리)
--    VALUES 절을 source 로 두고 tbl_post 와 JOIN 해 같은 id 를 PK 로 사용한다.
--    이 방식이 가장 짧고, 새 상품 추가 시 VALUES 한 줄만 더 쓰면 된다.
-- ============================================================
insert into tbl_post_product (id, product_category_id, product_price, product_stock)
select p.id, c.id, v.price, v.stock
from (values
    ('expert_a@test.com', '프리미엄 원두 커피 1kg',         '식품',         28000,   50),
    ('expert_a@test.com', '스테인리스 텀블러 500ml',         '수출',         18000,  100),
    ('expert_a@test.com', '친환경 패키지 박스 50세트',       '수출',         35000,   30),

    ('lee@test.com',      '한국산 김 세트 12개입',           '식품',         25000,   80),
    ('lee@test.com',      '국산 콩 된장 1kg',                '식품',         15000,   60),

    ('choi@test.com',     'HS코드 분류 컨설팅 패키지',       '관세',        500000,   20),

    ('kim@test.com',      '농산물 공동구매 박스 10kg',       '식품',         45000,   40)
) as v(email, title, cat, price, stock)
join tbl_member  m on m.member_email   = v.email
join tbl_post    p on p.member_id      = m.id
                  and p.title          = v.title
                  and p.post_status    = 'active'
join tbl_category c on c.category_name = v.cat;

-- ============================================================
-- 검증 쿼리 (선택)
-- ============================================================
-- 방금 들어간 상품 확인
-- select p.id, m.member_email, p.title, c.category_name,
--        pp.product_price, pp.product_stock
-- from tbl_post_product pp
--          join tbl_post p on pp.id = p.id
--          join tbl_member m on p.member_id = m.id
--          left join tbl_category c on c.id = pp.product_category_id
-- where m.member_email in ('expert_a@test.com','lee@test.com','choi@test.com','kim@test.com')
-- order by m.member_email, p.id desc;

-- ============================================================
-- 재실행 전용 cleanup (필요 시 주석 해제)
-- ============================================================
-- delete from tbl_post_product
-- where id in (
--     select p.id from tbl_post p
--     join tbl_member m on p.member_id = m.id
--     where m.member_email in ('expert_a@test.com','lee@test.com','choi@test.com','kim@test.com')
--       and p.title in (
--         '프리미엄 원두 커피 1kg', '스테인리스 텀블러 500ml', '친환경 패키지 박스 50세트',
--         '한국산 김 세트 12개입', '국산 콩 된장 1kg',
--         'HS코드 분류 컨설팅 패키지',
--         '농산물 공동구매 박스 10kg'
--       )
-- );
-- delete from tbl_post
-- where id in (
--     select p.id from tbl_post p
--     join tbl_member m on p.member_id = m.id
--     where m.member_email in ('expert_a@test.com','lee@test.com','choi@test.com','kim@test.com')
--       and p.title in (
--         '프리미엄 원두 커피 1kg', '스테인리스 텀블러 500ml', '친환경 패키지 박스 50세트',
--         '한국산 김 세트 12개입', '국산 콩 된장 1kg',
--         'HS코드 분류 컨설팅 패키지',
--         '농산물 공동구매 박스 10kg'
--       )
-- );
