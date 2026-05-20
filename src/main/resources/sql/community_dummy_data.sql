alter table public.tbl_subscription
    add column if not exists billing_key varchar(255);

alter table tbl_subscription drop column next_tier;
alter table tbl_subscription drop column next_billing_cycle;
alter table public.tbl_subscription
    add column if not exists amount bigint;


-- ============================================================
-- 커뮤니티 더미데이터 SQL (PostgreSQL)
-- 실행 순서: 이 파일을 통째로 실행
-- 주의: 기존 데이터가 있는 테이블은 ON CONFLICT 또는 WHERE NOT EXISTS 처리
-- ============================================================

-- 1) 더미 회원 50명 추가 (기존 회원과 충돌 방지)
INSERT INTO tbl_member (member_name, member_email, member_password, member_nickname, member_handle, member_bio, member_region, member_status, member_role)
SELECT
    '테스트유저' || gs,
    'community_test_' || gs || '@globalgates.com',
    '$2a$10$dummyHashedPasswordForTestingPurposes',
    CASE (gs % 10)
        WHEN 0 THEN '무역전문가' || gs
        WHEN 1 THEN '수출담당' || gs
        WHEN 2 THEN '물류매니저' || gs
        WHEN 3 THEN '관세사' || gs
        WHEN 4 THEN '바이어' || gs
        WHEN 5 THEN '셀러' || gs
        WHEN 6 THEN '포워더' || gs
        WHEN 7 THEN 'FTA전문' || gs
        WHEN 8 THEN '해외영업' || gs
        ELSE '글로벌트레이더' || gs
    END,
    'comm_user_' || gs,
    '글로벌 무역 커뮤니티 테스트 유저 #' || gs,
    CASE (gs % 5)
        WHEN 0 THEN '서울'
        WHEN 1 THEN '부산'
        WHEN 2 THEN '인천'
        WHEN 3 THEN '대구'
        ELSE '광주'
    END,
    'active',
    'business'
FROM generate_series(1, 50) gs
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_member WHERE member_email = 'community_test_' || gs || '@globalgates.com'
);

-- 2) 커뮤니티 10개 생성
INSERT INTO tbl_community (community_name, description, creator_id, community_status, category_id)
SELECT
    comm_name,
    comm_desc,
    (SELECT id FROM tbl_member WHERE member_email = 'community_test_' || creator_idx || '@globalgates.com'),
    'active',
    cat_id
FROM (VALUES
    ('글로벌 수출 포럼', '수출 관련 정보와 노하우를 공유하는 커뮤니티입니다.', 1, 1::bigint),
    ('수입 바이어 네트워크', '해외 제품 수입에 관심 있는 바이어들의 네트워크입니다.', 2, 2::bigint),
    ('해운물류 전문가 모임', '해운, 항공, 육상 물류 전문가들이 모여 최신 물류 트렌드를 공유합니다.', 3, 3::bigint),
    ('FTA/관세 스터디', 'FTA 활용법, HS코드 분류, 관세 환급 등 관세 실무를 함께 공부합니다.', 4, 4::bigint),
    ('무역금융 인사이트', '무역금융, 환율 리스크 관리, LC 실무 등 금융 관련 인사이트를 공유합니다.', 5, 5::bigint),
    ('무역 IT 혁신', '무역 플랫폼, 자동화, 블록체인 등 IT 기술을 활용한 무역 혁신을 논의합니다.', 6, 6::bigint),
    ('K-Food 수출 클럽', '한국 식품의 해외 수출 전략, 인증, 마케팅 경험을 공유합니다.', 7, 7::bigint),
    ('K-Beauty 글로벌', '한국 화장품 수출, 해외 인증, 유통 채널 정보를 나누는 커뮤니티입니다.', 8, 8::bigint),
    ('자동차부품 수출입', '자동차 부품의 수출입, OEM/ODM, 품질 인증 관련 정보를 교환합니다.', 9, 9::bigint),
    ('친환경 에너지 무역', '태양광, 풍력, ESG 관련 친환경 에너지 무역 트렌드를 공유합니다.', 10, 12::bigint)
) AS t(comm_name, comm_desc, creator_idx, cat_id)
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_community WHERE community_name = t.comm_name
);

-- 3) 커뮤니티 멤버 가입 (creator 포함)
-- creator 먼저
INSERT INTO tbl_community_member (community_id, member_id, member_role)
SELECT c.id, c.creator_id, 'member'
FROM tbl_community c
WHERE c.community_status = 'active'
  AND c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
ON CONFLICT (community_id, member_id) DO NOTHING;

-- 일반 멤버 (50% 확률 가입)
INSERT INTO tbl_community_member (community_id, member_id, member_role)
SELECT c.id, m.id, 'member'
FROM tbl_community c
CROSS JOIN tbl_member m
WHERE c.community_status = 'active'
  AND c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
  AND m.member_email LIKE 'community_test_%@globalgates.com'
  AND random() < 0.5
ON CONFLICT (community_id, member_id) DO NOTHING;

-- 기존 유저도 일부 커뮤니티에 가입
INSERT INTO tbl_community_member (community_id, member_id, member_role)
SELECT c.id, m.id, 'member'
FROM tbl_community c
CROSS JOIN tbl_member m
WHERE c.community_status = 'active'
  AND c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임')
  AND m.member_email NOT LIKE 'community_test_%@globalgates.com'
  AND m.member_status = 'active'
ON CONFLICT (community_id, member_id) DO NOTHING;

-- 4) 게시글 300개 생성 (커뮤니티당 30개)
DO $$
DECLARE
    comm_rec RECORD;
    member_ids bigint[];
    member_count int;
    i int;
    contents text[] := ARRAY[
        '오늘 미국 바이어와 첫 미팅을 했습니다. 생각보다 MOQ 기준이 높아서 협상이 필요할 것 같습니다.',
        '베트남 공장 실사 다녀왔습니다. 품질은 괜찮은데 납기가 좀 걱정됩니다.',
        'HS코드 분류 관련 질문입니다. 복합 소재 제품의 경우 어떤 기준으로 분류해야 하나요?',
        '유럽 REACH 규정 업데이트 공유합니다. 2026년부터 추가 물질이 규제 대상에 포함됩니다.',
        '환율이 또 출렁이네요. 헤지 전략 어떻게 가져가시나요? 선물환 vs NDF 고민 중입니다.',
        '아마존 FBA로 미국 시장 진출 준비 중입니다. 물류비 절감 팁 있으면 공유해주세요!',
        '올해 식품 박람회 일정 정리했습니다. SIAL Paris, Anuga, FoodEx Japan 등 참가 예정이신 분?',
        'LC(신용장) 조건 해석이 어렵습니다. 특히 transferable LC 관련해서 은행마다 해석이 다릅니다.',
        '중국 공장과의 커뮤니케이션 팁 공유합니다. WeChat 비즈니스 계정 활용하면 훨씬 효율적이에요.',
        '친환경 패키징으로 전환하면서 비용이 30% 증가했는데, 바이어 설득 방법이 고민입니다.',
        '일본 시장 진출 시 JIS 인증이 필수인데 인증 절차가 복잡합니다. 경험담 공유합니다.',
        '무역보험 가입하신 분들 어떤 상품 선택하셨나요? 한국무역보험공사 vs 민간보험 비교 중입니다.',
        '컨테이너 운임이 다시 오르고 있습니다. 장기 계약 vs 스팟 운임 어떤 전략이 좋을까요?',
        'K-뷰티 제품 FDA 등록 완료했습니다. 미국 시장 진출 준비 중인 분들 질문 있으시면 답변드릴게요.',
        'ESG 경영과 탄소국경조정제도(CBAM)가 앞으로 무역에 큰 영향을 줄 것 같습니다.',
        '동남아 시장이 정말 뜨거워요. 특히 인도네시아와 베트남에서 한국 제품 수요가 급증하고 있습니다.',
        '수출 대금 결제 방식 변경으로 인한 리스크 관리 방안 공유드립니다.',
        '무역 클레임 처리 경험 공유합니다. 품질 이슈로 바이어와 분쟁이 생겼을 때 대처법.',
        '올해 KOTRA 지원사업 신청하신 분 계신가요? 해외 시장 조사 지원금이 꽤 괜찮습니다.',
        '블록체인 기반 무역금융 플랫폼 시연해봤는데 서류 처리가 확실히 빨라지더라고요.',
        '중동 시장 진출 시 할랄 인증 취득 과정과 비용 정리해서 공유합니다.',
        '한-아세안 FTA 활용 시 원산지 증명서 발급 실무 팁 공유합니다.',
        '수출 포장 기준이 나라마다 다른데 주요 국가별 요구사항 정리했습니다.',
        '무역 영어 이메일 템플릿 모음입니다. 바이어 발굴부터 클레임 처리까지 상황별로 정리했어요.',
        '해외 전시회 참가 후기입니다. 부스 디자인과 샘플 준비가 정말 중요하더라고요.',
        '수입 통관 지연 시 대처 방법과 추가 비용 최소화 전략 공유합니다.',
        '국제 운송 보험 가입 시 주의사항. ICC(A), ICC(B), ICC(C) 조건 차이 설명합니다.',
        '해외 지사 설립 vs 현지 에이전트 활용, 어떤 방식이 더 효율적일까요?',
        '글로벌 공급망 다변화 전략. 중국 의존도를 줄이면서 품질을 유지하는 방법.',
        '신규 수출 시장 개척 시 가장 먼저 해야 할 5가지 체크리스트 공유합니다.'
    ];
BEGIN
    FOR comm_rec IN
        SELECT c.id AS community_id
        FROM tbl_community c
        WHERE c.community_status = 'active'
          AND c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
    LOOP
        SELECT array_agg(cm.member_id) INTO member_ids
        FROM tbl_community_member cm
        WHERE cm.community_id = comm_rec.community_id;

        member_count := array_length(member_ids, 1);
        IF member_count IS NULL OR member_count = 0 THEN CONTINUE; END IF;

        FOR i IN 1..30 LOOP
            INSERT INTO tbl_post (member_id, content, community_id, post_status, created_datetime)
            VALUES (
                member_ids[1 + (i % member_count)],
                contents[1 + (i % 30)],
                comm_rec.community_id,
                'active',
                now() - ((i * 3 + floor(random() * 24)::int) * interval '1 hour')
            );
        END LOOP;
    END LOOP;
END $$;

-- 5) 첨부파일 (로컬 static 경로 사용)
INSERT INTO tbl_file (original_name, file_name, file_path, file_size, content_type)
SELECT
    'sample-' || ((p.id % 20) + 1) || '.svg',
    'sample-' || ((p.id % 20) + 1) || '.svg',
    '/uploads/community/sample-' || ((p.id % 20) + 1) || '.svg',
    1024,
    'image'
FROM tbl_post p
JOIN tbl_community c ON c.id = p.community_id
WHERE c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
  AND p.post_status = 'active'
  AND random() < 0.6
  AND NOT EXISTS (SELECT 1 FROM tbl_post_file pf WHERE pf.post_id = p.id);

-- 6) tbl_post_file 연결
INSERT INTO tbl_post_file (post_id, file_id)
SELECT p.id, f.id
FROM tbl_post p
JOIN tbl_community c ON c.id = p.community_id
CROSS JOIN LATERAL (
    SELECT f2.id FROM tbl_file f2
    WHERE f2.file_path LIKE '/uploads/community/sample-%'
    ORDER BY random()
    LIMIT 1
) f
WHERE c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
  AND p.post_status = 'active'
  AND NOT EXISTS (SELECT 1 FROM tbl_post_file pf WHERE pf.post_id = p.id)
  AND random() < 0.5;

-- 7) 좋아요 더미
INSERT INTO tbl_post_like (member_id, post_id)
SELECT DISTINCT cm.member_id, p.id
FROM tbl_post p
JOIN tbl_community c ON c.id = p.community_id
JOIN tbl_community_member cm ON cm.community_id = c.id
WHERE c.community_name IN ('글로벌 수출 포럼','수입 바이어 네트워크','해운물류 전문가 모임','FTA/관세 스터디','무역금융 인사이트','무역 IT 혁신','K-Food 수출 클럽','K-Beauty 글로벌','자동차부품 수출입','친환경 에너지 무역')
  AND p.post_status = 'active'
  AND random() < 0.15
ON CONFLICT DO NOTHING;

-- 8) 인덱스
CREATE INDEX IF NOT EXISTS idx_post_community_feed
    ON tbl_post (community_id, post_status, reply_post_id, created_datetime DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_post_file_post
    ON tbl_post_file (post_id, file_id);
CREATE INDEX IF NOT EXISTS idx_community_member_list
    ON tbl_community_member (community_id, joined_at ASC, member_id);

-- 완료 확인
SELECT '=== 더미데이터 적재 완료 ===' AS status;
