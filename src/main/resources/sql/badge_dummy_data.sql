-- 뱃지 표시 검증용 더미 데이터
-- 두 가지 데이터 소스를 함께 채워 일관된 시각 결과를 만든다:
--   1) tbl_subscription  → mypage 사이드 뱃지 (subscriptionTier 기반)
--   2) tbl_badge         → main 피드 / post-detail 멘션 / expert 카드 뱃지 (badge_type JOIN)
--
-- SubscriptionService.subscribe 의 로직(tier ↔ badge_type 1:1, EXPERT tier 일 때 role 도 EXPERT)
-- 을 SQL 로 재현한 형태.
--
-- 사전 조건:
--   1) tbl_member 에 아래 이메일 회원이 존재
--      - expert_a@test.com (post_product_dummy_data.sql 또는 estimation_location_migration.sql 실행 후 존재)
--      - lee@test.com / choi@test.com (member.sql / dummy_data.sql 실행 후 존재)
--   2) enum 타입 subscription_tier / subscription_status / badge_type 가 정의되어 있어야 함
--      (globalgates_full_ddl.sql 기준)
--
-- ⚠️ 재실행 가능: 기존 active 구독은 inactive 처리 후 새로 insert.
--    badge 는 기존 row 가 있으면 삭제 후 새로 insert.

-- ============================================================
-- 1. tbl_subscription — 기존 active 구독을 inactive 처리
-- ============================================================
update tbl_subscription
set status = 'inactive'::subscription_status, updated_datetime = now()
where status = 'active'
  and member_id in (
      select id from tbl_member
      where member_email in ('expert_a@test.com', 'lee@test.com', 'choi@test.com')
  );

-- ============================================================
-- 2. tbl_subscription — 신규 active 구독 (1년 뒤 만료)
--    expires_at 을 멀리 두어 quartz 만료 스케줄러가 잡지 않게 한다.
-- ============================================================
insert into tbl_subscription (member_id, tier, billing_cycle, status, expires_at)
select m.id,
       v.tier::subscription_tier,
       'monthly',
       'active'::subscription_status,
       now() + interval '1 year'
from (values
    ('expert_a@test.com', 'expert'),
    ('lee@test.com',      'pro_plus'),
    ('choi@test.com',     'pro')
) as v(email, tier)
join tbl_member m on m.member_email = v.email;

-- ============================================================
-- 3. tbl_badge — 기존 row 정리
-- ============================================================
delete from tbl_badge
where member_id in (
    select id from tbl_member
    where member_email in ('expert_a@test.com', 'lee@test.com', 'choi@test.com')
);

-- ============================================================
-- 4. tbl_badge — 신규 row insert (subscription tier 와 동일 매핑)
-- ============================================================
insert into tbl_badge (member_id, badge_type)
select m.id, v.bt::badge_type
from (values
    ('expert_a@test.com', 'expert'),
    ('lee@test.com',      'pro_plus'),
    ('choi@test.com',     'pro')
) as v(email, bt)
join tbl_member m on m.member_email = v.email;

-- ============================================================
-- 검증 쿼리 (선택 — 주석 해제 후 단독 실행)
-- ============================================================
-- select m.member_email,
--        m.member_role,
--        s.tier as subscription_tier,
--        s.status as subscription_status,
--        b.badge_type
-- from tbl_member m
--          left join tbl_subscription s on s.member_id = m.id and s.status = 'active'
--          left join tbl_badge b on b.member_id = m.id
-- where m.member_email in ('expert_a@test.com', 'lee@test.com', 'choi@test.com', 'kim@test.com')
-- order by m.member_email;

-- ============================================================
-- 재실행 전용 cleanup (필요 시 주석 해제)
-- ============================================================
-- delete from tbl_subscription
-- where member_id in (
--     select id from tbl_member
--     where member_email in ('expert_a@test.com', 'lee@test.com', 'choi@test.com')
-- );
-- delete from tbl_badge
-- where member_id in (
--     select id from tbl_member
--     where member_email in ('expert_a@test.com', 'lee@test.com', 'choi@test.com')
-- );
