-- =============================================================
-- member_post_fix.sql
-- 이미 실행된 member_post.sql 의 tbl_file 경로를 S3 키로 일괄 변경
--   - tbl_file.file_name, tbl_file.file_path 양쪽을 '2026/05/20/{profile,post}/xx.jpg' 로 통일
--     (운영 코드의 yyyy/MM/dd 날짜 기반 키 컨벤션과 동일)
--   - 회원/게시글/해시태그 데이터는 건드리지 않음
-- 실행: psql -U globalgates -d globalgates -f member_post_fix.sql
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- [A] 프로필 파일 (tbl_file ← tbl_member_profile_file ← tbl_member)
-- -------------------------------------------------------------
UPDATE tbl_file f
SET file_name = k.s3_key,
    file_path = k.s3_key
FROM (VALUES
    ('jaeho.kim@globalgates.test',    '2026/05/20/profile/profile_01.jpg'),
    ('sumin.lee@globalgates.test',    '2026/05/20/profile/profile_02.jpg'),
    ('jiwon.park@globalgates.test',   '2026/05/20/profile/profile_03.jpg'),
    ('taeyoung.jung@globalgates.test','2026/05/20/profile/profile_04.jpg'),
    ('yena.choi@globalgates.test',    '2026/05/20/profile/profile_05.jpg'),
    ('seungwoo.han@globalgates.test', '2026/05/20/profile/profile_06.jpg'),
    ('chaerin.yoon@globalgates.test', '2026/05/20/profile/profile_07.jpg'),
    ('dohyun.lim@globalgates.test',   '2026/05/20/profile/profile_08.jpg'),
    ('nayoung.kang@globalgates.test', '2026/05/20/profile/profile_09.jpg'),
    ('jaemin.oh@globalgates.test',    '2026/05/20/profile/profile_10.jpg'),
    ('jian.song@globalgates.test',    '2026/05/20/profile/profile_11.jpg'),
    ('hyunwoo.bae@globalgates.test',  '2026/05/20/profile/profile_12.jpg'),
    ('yujin.noh@globalgates.test',    '2026/05/20/profile/profile_13.jpg'),
    ('minho.hwang@globalgates.test',  '2026/05/20/profile/profile_14.jpg'),
    ('yerin.shin@globalgates.test',   '2026/05/20/profile/profile_15.jpg'),
    ('taewoo.kwon@globalgates.test',  '2026/05/20/profile/profile_16.jpg'),
    ('haneul.cho@globalgates.test',   '2026/05/20/profile/profile_17.jpg'),
    ('siwoo.yang@globalgates.test',   '2026/05/20/profile/profile_18.jpg'),
    ('gaeun.moon@globalgates.test',   '2026/05/20/profile/profile_19.jpg'),
    ('seonho.baek@globalgates.test',  '2026/05/20/profile/profile_20.jpg')
) AS k(email, s3_key)
JOIN tbl_member m                ON m.member_email = k.email
JOIN tbl_member_profile_file mpf ON mpf.member_id  = m.id
WHERE f.id = mpf.id;

-- -------------------------------------------------------------
-- [B] 게시글 파일 (tbl_file ← tbl_post_file ← tbl_post)
--     post.title 로 매핑 (member_post.sql 에서 작성한 제목 그대로)
-- -------------------------------------------------------------
UPDATE tbl_file f
SET file_name = k.s3_key,
    file_path = k.s3_key
FROM (VALUES
    ('2026 하반기 메모리 반도체 시장 전망 — DRAM·HBM 수급 분석',          '2026/05/20/post/post_01.jpg'),
    ('동남아·중동 K-뷰티 진출 전략 — 채널별 GTM 가이드',                  '2026/05/20/post/post_02.jpg'),
    ('K-Food 수출 인증 트랙 정리 — HACCP·HALAL·FDA·FSVP',                '2026/05/20/post/post_03.jpg'),
    ('전기차 전환과 자동차부품 수출 구조 변화',                            '2026/05/20/post/post_04.jpg'),
    ('유럽 SPA 바이어의 친환경 원단 인증 요구사항',                        '2026/05/20/post/post_05.jpg'),
    ('RCEP 발효 4년차 — 활용 실효성 점검',                                 '2026/05/20/post/post_06.jpg'),
    ('HS코드 분류 분쟁 — 실무에서 자주 발생하는 5개 사례',                 '2026/05/20/post/post_07.jpg'),
    ('부산·광양·인천항 비교 — 항로별 최적 항만 선택',                      '2026/05/20/post/post_08.jpg'),
    ('Amazon US 진출 — 첫 90일 핵심 실행 체크리스트',                      '2026/05/20/post/post_09.jpg'),
    ('신용장(L/C) 네고 디스크레판시 — UCP 600 기반 사전 점검 포인트',      '2026/05/20/post/post_10.jpg'),
    ('베트남 진출 법인 형태 비교 — WFOE·JV·RO',                            '2026/05/20/post/post_11.jpg'),
    ('유럽 가전 바이어 관점 — 한국 ODM에 기대하는 4가지',                  '2026/05/20/post/post_12.jpg'),
    ('석유화학 원료 수입 환헤지 운영 사례',                                '2026/05/20/post/post_13.jpg'),
    ('동유럽 기계장비 입찰 — 폴란드·체코 시장 비교',                       '2026/05/20/post/post_14.jpg'),
    ('중소·중견 수출기업이 활용해야 할 K-SURE 핵심 상품 4선',              '2026/05/20/post/post_15.jpg'),
    ('2026년 5월 해상운임 동향 — SCFI 기반 권역별 업데이트',               '2026/05/20/post/post_16.jpg'),
    ('Alibaba.com 셀러 매출 5배 성장 사례 — 핵심 운영 지표',               '2026/05/20/post/post_17.jpg'),
    ('딸기 수출 콜드체인 운영 매뉴얼 — 대전·인천공항·홍콩 루트',           '2026/05/20/post/post_18.jpg'),
    ('의료기기 미국 진출 — 510(k)·De Novo 경로 비교',                      '2026/05/20/post/post_19.jpg'),
    ('브라질 시장 진출 — ICMS·IPI 등 다층 조세구조 이해',                  '2026/05/20/post/post_20.jpg'),
    ('AI 서버용 HBM 공급 부족 — 언제까지 지속될 것인가',                   '2026/05/20/post/post_21.jpg'),
    ('사우디 SFDA 화장품 인증 가이드 — 등록 절차와 일정',                  '2026/05/20/post/post_22.jpg'),
    ('EU CBAM 본격 시행 — 수출기업의 우선 준비사항',                       '2026/05/20/post/post_23.jpg'),
    ('LCL과 FCL 운영 손익분기점 — 부피·중량·화물특성 기준',                '2026/05/20/post/post_24.jpg'),
    ('의류 OEM 샘플링 단계의 핵심 리스크 3가지',                           '2026/05/20/post/post_25.jpg')
) AS k(title, s3_key)
JOIN tbl_post p      ON p.title    = k.title
JOIN tbl_post_file pf ON pf.post_id = p.id
WHERE f.id = pf.file_id;

COMMIT;

-- -------------------------------------------------------------
-- 검증
-- -------------------------------------------------------------
SELECT 'profile_files' AS what,
       COUNT(*) FILTER (WHERE file_path LIKE '2026/05/20/profile/%') AS fixed,
       COUNT(*) AS total
FROM tbl_file
WHERE id IN (
    SELECT id FROM tbl_member_profile_file
    WHERE member_id IN (SELECT id FROM tbl_member WHERE member_email LIKE '%@globalgates.test')
)
UNION ALL
SELECT 'post_files',
       COUNT(*) FILTER (WHERE file_path LIKE '2026/05/20/post/%') AS fixed,
       COUNT(*) AS total
FROM tbl_file
WHERE id IN (
    SELECT file_id FROM tbl_post_file
    WHERE post_id IN (
        SELECT id FROM tbl_post
        WHERE member_id IN (SELECT id FROM tbl_member WHERE member_email LIKE '%@globalgates.test')
    )
);
