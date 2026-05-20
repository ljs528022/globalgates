-- =============================================================
-- member_post.sql
-- GlobalGates 무역 글로벌 커뮤니티 더미 데이터
--   - 회원(tbl_member, tbl_business_member)
--   - 프로필 사진(tbl_file, tbl_member_profile_file)
--   - 게시글(tbl_post)
--   - 게시글 사진(tbl_file, tbl_post_file)
--   - 해시태그(tbl_post_hashtag, tbl_post_hashtag_rel)
--
-- 실행: psql -U globalgates -d globalgates -f member_post.sql
-- 비밀번호 평문: "1234" (BCrypt 해시 사용)
-- 사진: S3 객체 키를 file_name / file_path 양쪽에 동일하게 저장.
--       실제 이미지는 함께 제공되는 upload_dummy_images.sh 로
--       AWS_BUCKET_NAME 의 2026/05/20/{profile,post}/ 경로에 사전 업로드 필요.
--       (운영 코드의 yyyy/MM/dd/ 날짜 기반 키 컨벤션과 동일 — getTodayPath() 참고)
-- 재실행 시: 회원·해시태그는 ON CONFLICT 로 스킵. 파일/게시글은 중복 방지를 위해
--          1회 실행 권장.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- [1] 회원
--   - 실명(국문) + 핸들(영문 dot-case, LinkedIn 형식)
--   - 닉네임은 "성명 │ 소속/전문분야" 형식 (실사용자 프로필 톤)
--   - 회사명은 가상이나 실제 무역업 명명 관례(영문/국문 조합) 준수
-- -------------------------------------------------------------
INSERT INTO tbl_member
    (member_name, member_email, member_password, member_nickname, member_handle,
     member_phone, member_bio, member_region, member_country, member_language, member_role)
VALUES
    ('김재호',  'jaeho.kim@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '김재호 │ Semicom Korea 해외영업팀장',  '@kim.jaeho',   '01010001001',
     '메모리 반도체(DRAM/NAND) 해외영업 12년. 북미·유럽 OEM 어카운트 매니지먼트. 사내 수출통제 자율준수프로그램(ICP) 운영 담당.',
     '경기 기흥', 'KR', 'ko', 'business'),

    ('이수민',  'sumin.lee@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '이수민 │ Lumiere Cosmetic 글로벌사업본부장', '@lee.sumin', '01010001002',
     'K-뷰티 해외영업 14년. 동남아·중동·중남미 24개국 유통망 운영. 신규 디스트리뷰터 발굴 및 현지 인허가 총괄.',
     '서울 강남', 'KR', 'ko', 'business'),

    ('박지원',  'jiwon.park@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '박지원 │ Korea Food World 수출사업부 차장', '@park.jiwon', '01010001003',
     '식품 수출 8년. HACCP·HALAL·FDA·FSVP 인증 실무. 김치·면류·소스류의 일본/동남아 채널 운영.',
     '부산 해운대', 'KR', 'ko', 'business'),

    ('정태영',  'taeyoung.jung@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '정태영 │ Ulsan AutoParts 수출영업 과장', '@jung.taeyoung', '01010001004',
     '자동차부품 1차 벤더(현대·기아 협력사) 수출 담당. CKD/SKD 납품, IATF 16949 품질대응, 동유럽 현지공장 SCM 실무.',
     '울산 북구', 'KR', 'ko', 'business'),

    ('최예나',  'yena.choi@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '최예나 │ EcoFabric Korea 수출 MD', '@choi.yena', '01010001005',
     '의류 OEM 수출 9년. 유럽 SPA 브랜드 어카운트 운영. GRS·OEKO-TEX·BCI 인증 및 EU ESPR 대응 실무.',
     '대구 동구', 'KR', 'ko', 'business'),

    ('한승우',  'seungwoo.han@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '한승우 │ FTA 컨설턴트 (전 관세청)', '@han.seungwoo', '01010001006',
     '관세청 출신. 한-아세안·RCEP·한-EU FTA 활용 전략 자문. 원산지관리시스템 구축 프로젝트 50건 이상 수행.',
     '서울 종로', 'KR', 'ko', 'expert'),

    ('윤채린',  'chaerin.yoon@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '윤채린 │ 관세사 (인천공항 통관법인)', '@yoon.chaerin', '01010001007',
     '관세사 / 인천공항 소재 통관법인 소속. HS코드 분류, 관세환급, 세관 사후심사 대응 전문. 전자제품·화장품 품목 특화.',
     '인천 중구', 'KR', 'ko', 'expert'),

    ('임도현',  'dohyun.lim@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '임도현 │ 국제물류 시니어 컨설턴트', '@lim.dohyun', '01010001008',
     '국제물류 17년. 해상·항공·복합운송 최적화 자문. 부산항·인천공항·로테르담 라인 핸들링 경험. 위험화물(IMDG/IATA DGR) 운영 경력.',
     '부산 중구', 'KR', 'ko', 'expert'),

    ('강나영',  'nayoung.kang@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '강나영 │ Global Marketing Lab 대표 컨설턴트', '@kang.nayoung', '01010001009',
     '글로벌 디지털 마케팅 컨설턴트. Amazon·Shopee·Rakuten B2C 수출 셀러 컨설팅 200건 이상. 브랜드 등록·A+ 콘텐츠·광고 전략 수립.',
     '서울 성수', 'KR', 'ko', 'business'),

    ('오재민',  'jaemin.oh@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '오재민 │ 무역금융 전문위원 (전 시중은행 외환사업부)', '@oh.jaemin', '01010001010',
     '국내 시중은행 외환사업부 13년 경력. 신용장(L/C), D/A·D/P, 포페이팅, 무역금융 솔루션 자문. UCP 600·URC 522 실무.',
     '서울 여의도', 'KR', 'ko', 'expert'),

    ('송지안',  'jian.song@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '송지안 │ 동남아 시장 진출 자문역 (호치민 거주)', '@song.jian', '01010001011',
     '호치민 거주 11년. 베트남·인도네시아·필리핀 현지 법인 설립(WFOE/JV/RO) 및 인허가 자문. 식음료·뷰티·B2B SaaS 진출 프로젝트 다수.',
     '베트남 호치민', 'VN', 'ko', 'expert'),

    ('배현우',  'hyunwoo.bae@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '배현우 │ EuroTech Sourcing 대표 (함부르크)',  '@bae.hyunwoo', '01010001012',
     '독일 함부르크 기반 가전·IoT 디바이스 바이어. 한국 ODM 소싱 7년. CE·RoHS·EPR 대응 및 EU 유통 파트너 매칭.',
     '광주 광산', 'KR', 'ko', 'business'),

    ('노유진',  'yujin.noh@globalgates.test',   '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '노유진 │ Incheon Chemical 원료수입팀 과장', '@noh.yujin', '01010001013',
     '석유화학 원료(PE/PVC/PP) 수입. 사우디·싱가포르·말레이시아 트레이더 네트워크 운영. 환변동 헤지 실무.',
     '인천 연수', 'KR', 'ko', 'business'),

    ('황민호',  'minho.hwang@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '황민호 │ Changwon MachineWorks 해외영업팀', '@hwang.minho', '01010001014',
     '공작기계·산업로봇 수출 영업. CE·UL 인증 대응. 동유럽·중동 입찰 프로젝트 수주 경험. ISO 9001/14001 사내 심사원 자격 보유.',
     '경남 창원', 'KR', 'ko', 'business'),

    ('신예린',  'yerin.shin@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '신예린 │ 수출보험 전문위원 (전 K-SURE)', '@shin.yerin', '01010001015',
     '한국무역보험공사 출신. 단기수출보험·환변동보험·중장기 프로젝트 보험 자문. 중소·중견기업 수출 리스크 관리 컨설팅.',
     '서울 강서', 'KR', 'ko', 'expert'),

    ('권태우',  'taewoo.kwon@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '권태우 │ 국제물류 포워더 (FCL/LCL/항공)', '@kwon.taewoo', '01010001016',
     '포워더 14년. FCL·LCL·항공 견적 및 운영. 위험화물(IMO/IATA DGR), 정온 콘테이너(Reefer) 핸들링 전문.',
     '부산 강서', 'KR', 'ko', 'expert'),

    ('조하늘',  'haneul.cho@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '조하늘 │ Digital Trade Hub 운영총괄', '@cho.haneul', '01010001017',
     'B2B 디지털 무역 플랫폼 운영. Alibaba.com·TradeIndia·EC21 셀러 그로스 컨설팅. RFQ 대응·트랜잭션 보호(Trade Assurance) 운영.',
     '서울 마포', 'KR', 'ko', 'business'),

    ('양시우',  'siwoo.yang@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '양시우 │ Daejeon Fresh Farm 수출사업부장', '@yang.siwoo', '01010001018',
     '농산물 수출(딸기·배·파프리카). 콜드체인 설계 및 동남아 검역(SPS) 대응 실무. 농식품부 수출 유망주체 선정.',
     '대전 유성', 'KR', 'ko', 'business'),

    ('문가은',  'gaeun.moon@globalgates.test',  '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '문가은 │ HealthGlobal Med 글로벌 RA 매니저', '@moon.gaeun', '01010001019',
     '의료기기·건강기능식품 해외 인허가(RA). 미국 FDA 510(k)·De Novo, EU CE-MDR/IVDR, 일본 PMDA 대응 실무.',
     '서울 송파', 'KR', 'ko', 'business'),

    ('백선호',  'seonho.baek@globalgates.test', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
     '백선호 │ 중남미 통상정책 분석관 (KOTRA 출신)', '@baek.seonho', '01010001020',
     'KOTRA 상파울루·멕시코시티 무역관 근무 9년. 메르코수르·태평양동맹 통상정책 분석. ICMS·IPI 등 브라질 조세 구조 자문.',
     '서울 영등포', 'KR', 'ko', 'expert')
ON CONFLICT (member_email) DO NOTHING;

-- -------------------------------------------------------------
-- [2] 사업자 정보
-- -------------------------------------------------------------
INSERT INTO tbl_business_member (id, business_number, company_name, ceo_name, business_type)
SELECT m.id, t.business_number, t.company_name, t.ceo_name, t.business_type
FROM (VALUES
    ('jaeho.kim@globalgates.test',    '214-86-10001', 'Semicom Korea Co., Ltd.',         '김재호', '제조·도매(반도체)'),
    ('sumin.lee@globalgates.test',    '214-86-10002', 'Lumiere Cosmetic Inc.',           '이수민', '제조·수출(화장품)'),
    ('jiwon.park@globalgates.test',   '214-86-10003', 'Korea Food World Co., Ltd.',      '박지원', '식품 제조·수출'),
    ('taeyoung.jung@globalgates.test','214-86-10004', 'Ulsan AutoParts Co., Ltd.',       '정태영', '자동차부품 제조'),
    ('yena.choi@globalgates.test',    '214-86-10005', 'EcoFabric Korea Inc.',            '최예나', '섬유·의류 OEM'),
    ('nayoung.kang@globalgates.test', '214-86-10006', 'Global Marketing Lab Co., Ltd.',  '강나영', '컨설팅·마케팅'),
    ('hyunwoo.bae@globalgates.test',  '214-86-10007', 'EuroTech Sourcing GmbH (KR 지사)','배현우', '도소매·수입'),
    ('yujin.noh@globalgates.test',    '214-86-10008', 'Incheon Chemical Co., Ltd.',      '노유진', '화학 원료 수입·도매'),
    ('minho.hwang@globalgates.test',  '214-86-10009', 'Changwon MachineWorks Co., Ltd.', '황민호', '기계·산업로봇 제조'),
    ('haneul.cho@globalgates.test',   '214-86-10010', 'Digital Trade Hub Inc.',          '조하늘', 'IT 플랫폼 서비스'),
    ('siwoo.yang@globalgates.test',   '214-86-10011', 'Daejeon Fresh Farm Co., Ltd.',    '양시우', '농산물 수출'),
    ('gaeun.moon@globalgates.test',   '214-86-10012', 'HealthGlobal Med Inc.',           '문가은', '의료기기 수출')
) AS t(email, business_number, company_name, ceo_name, business_type)
JOIN tbl_member m ON m.member_email = t.email
ON CONFLICT (business_number) DO NOTHING;

-- -------------------------------------------------------------
-- [3] 프로필 사진 (tbl_file → tbl_member_profile_file)
--     실제 S3 객체 키를 file_name / file_path 양쪽에 동일하게 저장.
--     (컨트롤러마다 getFileName() 또는 getFilePath() 중 다른 컬럼을 키로 사용하므로 일관성 유지를 위해 둘 다 동일 키)
--     실제 이미지 파일은 별도 업로드 스크립트로 S3 2026/05/20/profile/ 폴더에 사전 업로드 필요.
-- -------------------------------------------------------------
WITH profile_data(email, original_name, s3_key) AS (
    VALUES
    ('jaeho.kim@globalgates.test',    'profile_kim_jaeho.jpg',    '2026/05/20/profile/profile_01.jpg'),
    ('sumin.lee@globalgates.test',    'profile_lee_sumin.jpg',    '2026/05/20/profile/profile_02.jpg'),
    ('jiwon.park@globalgates.test',   'profile_park_jiwon.jpg',   '2026/05/20/profile/profile_03.jpg'),
    ('taeyoung.jung@globalgates.test','profile_jung_taeyoung.jpg','2026/05/20/profile/profile_04.jpg'),
    ('yena.choi@globalgates.test',    'profile_choi_yena.jpg',    '2026/05/20/profile/profile_05.jpg'),
    ('seungwoo.han@globalgates.test', 'profile_han_seungwoo.jpg', '2026/05/20/profile/profile_06.jpg'),
    ('chaerin.yoon@globalgates.test', 'profile_yoon_chaerin.jpg', '2026/05/20/profile/profile_07.jpg'),
    ('dohyun.lim@globalgates.test',   'profile_lim_dohyun.jpg',   '2026/05/20/profile/profile_08.jpg'),
    ('nayoung.kang@globalgates.test', 'profile_kang_nayoung.jpg', '2026/05/20/profile/profile_09.jpg'),
    ('jaemin.oh@globalgates.test',    'profile_oh_jaemin.jpg',    '2026/05/20/profile/profile_10.jpg'),
    ('jian.song@globalgates.test',    'profile_song_jian.jpg',    '2026/05/20/profile/profile_11.jpg'),
    ('hyunwoo.bae@globalgates.test',  'profile_bae_hyunwoo.jpg',  '2026/05/20/profile/profile_12.jpg'),
    ('yujin.noh@globalgates.test',    'profile_noh_yujin.jpg',    '2026/05/20/profile/profile_13.jpg'),
    ('minho.hwang@globalgates.test',  'profile_hwang_minho.jpg',  '2026/05/20/profile/profile_14.jpg'),
    ('yerin.shin@globalgates.test',   'profile_shin_yerin.jpg',   '2026/05/20/profile/profile_15.jpg'),
    ('taewoo.kwon@globalgates.test',  'profile_kwon_taewoo.jpg',  '2026/05/20/profile/profile_16.jpg'),
    ('haneul.cho@globalgates.test',   'profile_cho_haneul.jpg',   '2026/05/20/profile/profile_17.jpg'),
    ('siwoo.yang@globalgates.test',   'profile_yang_siwoo.jpg',   '2026/05/20/profile/profile_18.jpg'),
    ('gaeun.moon@globalgates.test',   'profile_moon_gaeun.jpg',   '2026/05/20/profile/profile_19.jpg'),
    ('seonho.baek@globalgates.test',  'profile_baek_seonho.jpg',  '2026/05/20/profile/profile_20.jpg')
),
inserted_profile_files AS (
    INSERT INTO tbl_file (original_name, file_name, file_path, file_size, content_type)
    SELECT pd.original_name, pd.s3_key, pd.s3_key, 102400, 'image'::file_content_type
    FROM profile_data pd
    RETURNING id, file_path
)
INSERT INTO tbl_member_profile_file (id, member_id, profile_image_type)
SELECT ipf.id, m.id, 'profile'::profile_type
FROM inserted_profile_files ipf
JOIN profile_data pd ON pd.s3_key = ipf.file_path
JOIN tbl_member m   ON m.member_email = pd.email;

-- -------------------------------------------------------------
-- [4] 게시글 + 게시글 사진
--     - 격식체(~합니다) 중심, 산업/시장 리포트 톤
--     - 본문 길이 200~500자 수준, 실무에 바로 적용 가능한 정보 위주
-- -------------------------------------------------------------
WITH post_data(email, title, content, original_name, s3_key) AS (
    VALUES
    ('jaeho.kim@globalgates.test',
     '2026 하반기 메모리 반도체 시장 전망 — DRAM·HBM 수급 분석',
     '북미 하이퍼스케일러의 AI 인프라 투자 확대로 DRAM 평균판매단가(ASP)가 3분기 이후 반등세를 보이고 있습니다. 특히 HBM3E는 주요 GPU 벤더의 차세대 어셈블리에 본격 채용되어 2027년 상반기까지 공급 부족이 지속될 것으로 전망됩니다. 한편 미국 BIS의 대중 첨단 반도체 수출통제가 14nm 이하 공정장비까지 확대됨에 따라, 국내 기업은 ICP(자율준수프로그램) 재정비와 라이선스 사전 검토 체계를 강화해야 합니다.',
     'post_semiconductor_export.jpg',
     '2026/05/20/post/post_01.jpg'),

    ('sumin.lee@globalgates.test',
     '동남아·중동 K-뷰티 진출 전략 — 채널별 GTM 가이드',
     '베트남 시장은 "비건·저자극" 클레임이 차별화 포인트이며, 인도네시아는 HALAL 인증과 합리적 가격대가 핵심 진입 요건입니다. 사우디·UAE 등 GCC 지역은 SFDA·ECAS 등록을 거쳐야 정식 유통이 가능합니다. 채널 측면에서는 마이크로 인플루언서 시딩과 Shopee 라이브커머스를 결합한 모델이 ROAS 측면에서 가장 안정적인 결과를 보이고 있습니다.',
     'post_kbeauty_market.jpg',
     '2026/05/20/post/post_02.jpg'),

    ('jiwon.park@globalgates.test',
     'K-Food 수출 인증 트랙 정리 — HACCP·HALAL·FDA·FSVP',
     '식품 수출 인증 경로를 권역별로 정리합니다. 국내 HACCP를 기본 전제로, 일본은 후생노동성 잔류농약 기준 적합 여부 확인, 중동은 지역별 HALAL 인증(말레이시아 JAKIM, 인도네시아 MUI 등), 미국은 FDA 시설등록 및 FSVP 대응, EU는 RASFF 이슈 케이스의 사전 점검이 필수입니다. 평균 인증 취득 기간은 6~9개월이며, 라벨링 번역과 영양성분 분석에도 별도 일정이 필요합니다.',
     'post_kfood_certification.jpg',
     '2026/05/20/post/post_03.jpg'),

    ('taeyoung.jung@globalgates.test',
     '전기차 전환과 자동차부품 수출 구조 변화',
     '내연기관 파워트레인 부품 수요가 감소하는 반면, 배터리팩 하우징·구동모터·BMS 보드·열관리 시스템 부품의 수출이 빠르게 증가하고 있습니다. 헝가리·폴란드 현지 EV 공장 납품 비중이 확대되고 있으며, EU CBAM 시행에 따라 탄소배출량 보고 의무가 본격화되었습니다. 1차 벤더뿐 아니라 2·3차 협력사도 ISO 14064 기반 산정체계 구축이 필요한 시점입니다.',
     'post_ev_parts.jpg',
     '2026/05/20/post/post_04.jpg'),

    ('yena.choi@globalgates.test',
     '유럽 SPA 바이어의 친환경 원단 인증 요구사항',
     '유럽 SPA 브랜드 OEM에서 표준화된 인증은 GRS(Global Recycled Standard), OEKO-TEX STANDARD 100, BCI Cotton, RWS(Responsible Wool Standard)입니다. 2026년부터는 EU 지속가능제품 규정(ESPR)에 따른 디지털 제품여권(DPP) 대응이 추가됩니다. 인증 발급·갱신 비용을 단가 견적 단계에서 분리 항목으로 반영하는 것이 협상에 유리합니다.',
     'post_fashion_textile.jpg',
     '2026/05/20/post/post_05.jpg'),

    ('seungwoo.han@globalgates.test',
     'RCEP 발효 4년차 — 활용 실효성 점검',
     'RCEP은 단순 관세 인하 측면에서는 한-아세안 FTA·한-중 FTA 등 기존 양자협정 대비 활용도가 제한적인 경우가 많습니다. 다만 누적원산지 규정이 매우 관대하여, 베트남 등 역내 가공을 거쳐 일본·호주로 수출하는 공급망에서는 RCEP이 가장 효율적입니다. 협정 활용 전 HS코드별 양허율과 원산지결정기준(PSR) 비교 검토가 선행되어야 합니다.',
     'post_fta_rcep.jpg',
     '2026/05/20/post/post_06.jpg'),

    ('chaerin.yoon@globalgates.test',
     'HS코드 분류 분쟁 — 실무에서 자주 발생하는 5개 사례',
     '관세 분쟁의 대표 유형은 다음과 같습니다. (1) 복합기능 제품(스마트워치 등)의 본질적 특성 판단 누락, (2) 액세서리·부분품을 본체 코드로 신고, (3) 화장품과 의약외품 경계 분류, (4) 식품첨가물과 일반식품 구분, (5) 산업용과 가정용 기계의 호 번호 차이. 사전심사(Advance Ruling) 제도를 활용하면 통관 후 추징 리스크를 효과적으로 차단할 수 있습니다.',
     'post_hs_code.jpg',
     '2026/05/20/post/post_07.jpg'),

    ('dohyun.lim@globalgates.test',
     '부산·광양·인천항 비교 — 항로별 최적 항만 선택',
     '항만 선택은 화물 종류와 항로 특성에 따라 결정되어야 합니다. 대미주 노선은 부산항이 선복량과 운임 측면에서 가장 유리하고, 동남아·중국 근해는 광양항이 경쟁력 있는 운임을 제공합니다. 중국 위해·청도 페리 화물은 인천항이 리드타임에서 앞섭니다. 최근 부산 신항 적체로 광양 분산 비중이 늘고 있으니, 화주별 SLA 기준을 명확히 두고 결정하는 것이 바람직합니다.',
     'post_busan_port.jpg',
     '2026/05/20/post/post_08.jpg'),

    ('nayoung.kang@globalgates.test',
     'Amazon US 진출 — 첫 90일 핵심 실행 체크리스트',
     '아마존 미국 진출의 초기 90일 동안은 다음 순서를 권장합니다. (1) 미국 LLC 설립 및 EIN 발급, W-8BEN-E 사전 준비, (2) 상표 등록 후 Amazon Brand Registry 가입, (3) FNSKU 라벨링 및 FBA 입고, (4) A+ 콘텐츠와 브랜드 스토어 구축, (5) PPC 광고 운영(ACOS 30% 이하 유지). 초기 3개월은 광고 적자를 감수하더라도 검증된 리뷰 100건 확보를 최우선 목표로 삼는 것이 효과적입니다.',
     'post_amazon_seller.jpg',
     '2026/05/20/post/post_09.jpg'),

    ('jaemin.oh@globalgates.test',
     '신용장(L/C) 네고 디스크레판시 — UCP 600 기반 사전 점검 포인트',
     '네고 거절 사유의 대부분은 사전 점검으로 예방 가능합니다. 가장 빈번한 케이스는 (1) B/L의 Shipper·Consignee·Notify Party 기재 불일치, (2) 보험증권의 부보금액 부족(CIF의 110% 원칙 위반), (3) Late Shipment 또는 Late Presentation입니다. 선적 직전 셀러 측에서 셀프 체크리스트를 운영하고, 매입은행과 사전에 서류 초안을 공유하는 것이 디스크레판시 발생률을 크게 낮춥니다.',
     'post_lc_finance.jpg',
     '2026/05/20/post/post_10.jpg'),

    ('jian.song@globalgates.test',
     '베트남 진출 법인 형태 비교 — WFOE·JV·RO',
     '베트남 진출 시 선택 가능한 법인 형태는 세 가지입니다. (1) 100% 외투법인(WFOE)은 의사결정 속도가 빠르나 인허가 절차가 길고, (2) 합작법인(JV)은 현지 파트너 네트워크 활용에 유리하나 거버넌스 협의가 필요하며, (3) 대표사무소(RO)는 영업활동이 불가하여 시장조사 단계에 한정됩니다. DPI 등록부터 IRC·ERC 발급까지 통상 60~90일이 소요되며, 호치민·하노이 간 처리 속도 차이가 존재합니다.',
     'post_vietnam_market.jpg',
     '2026/05/20/post/post_11.jpg'),

    ('hyunwoo.bae@globalgates.test',
     '유럽 가전 바이어 관점 — 한국 ODM에 기대하는 4가지',
     '독일·네덜란드를 중심으로 한 유럽 가전 바이어는 가격보다 다음 요소를 우선시합니다. (1) 에너지 효율 A등급 인증, (2) CE·RoHS 적합성, (3) EPR(폐기물 회수) 등록 완료, (4) 24개월 무상 AS 보증. 한국 ODM이 가진 IoT 연동·AI 기능을 적극적으로 어필할 경우 단가 협상력이 향상되며, 평균 ASP를 5~10% 상향 유지할 수 있습니다.',
     'post_eu_electronics.jpg',
     '2026/05/20/post/post_12.jpg'),

    ('yujin.noh@globalgates.test',
     '석유화학 원료 수입 환헤지 운영 사례',
     '폴리에틸렌·PVC·PP 등 석유화학 원료는 달러 결제 비중이 높아 환율 변동에 직접 노출됩니다. 당사의 경우 6개월 선물환 60%, 통화옵션 콜라(Collar) 구조 40%로 분산 헤지를 운영하고 있습니다. 한국수출입은행과 무역보험공사의 환변동보험을 병행 활용하면 추가 비용 절감이 가능합니다. 풀헤지보다 60~70% 비중의 부분 헤지가 일반적으로 권장됩니다.',
     'post_petrochem_import.jpg',
     '2026/05/20/post/post_13.jpg'),

    ('minho.hwang@globalgates.test',
     '동유럽 기계장비 입찰 — 폴란드·체코 시장 비교',
     '폴란드는 입찰 물량이 크고 가격 경쟁이 치열한 시장이며, 체코는 단가 수용 폭이 상대적으로 넓으나 기술사양 요구가 까다롭습니다. 양국 모두 CE 적합성 및 Machinery Directive 2006/42/EC 준수가 필수이며, 현지 에이전트 수수료는 통상 계약금액의 5~8% 수준입니다. 입찰 준비 단계에서 EU 식별번호(EORI) 및 산업안전 인증을 미리 확보해야 일정 차질을 방지할 수 있습니다.',
     'post_machinery_bid.jpg',
     '2026/05/20/post/post_14.jpg'),

    ('yerin.shin@globalgates.test',
     '중소·중견 수출기업이 활용해야 할 K-SURE 핵심 상품 4선',
     '한국무역보험공사 상품 중 실무 활용도가 높은 네 가지를 정리합니다. (1) 단기수출보험(선적후)은 바이어 신용위험 커버, (2) 중소중견 Plus+ 특약은 보험료 50% 할인, (3) 환변동보험은 환차손 헤지, (4) 수출신용보증(선적전)은 운영자금 조달을 지원합니다. 가입 전 K-SURE 무료 컨설팅을 통해 자사 수출구조에 적합한 상품 조합을 사전 진단받는 것이 권장됩니다.',
     'post_export_insurance.jpg',
     '2026/05/20/post/post_15.jpg'),

    ('taewoo.kwon@globalgates.test',
     '2026년 5월 해상운임 동향 — SCFI 기반 권역별 업데이트',
     '5월 SCFI 지수 기준 상해-유럽 라인 운임은 전월 대비 12% 상승했습니다. 홍해 사태 장기화와 파나마 운하 가뭄으로 우회 항로 운영이 일상화되었으며, 평균 리드타임이 7~10일 증가한 상태입니다. 5~8월 성수기 진입을 앞두고 BAF·PSS 등 추가 부대비 고지가 예상되니, 분기 단위 운임 계약과 선복 우선 확보(Space Allocation)를 동시에 진행하시는 것을 권합니다.',
     'post_freight_rate.jpg',
     '2026/05/20/post/post_16.jpg'),

    ('haneul.cho@globalgates.test',
     'Alibaba.com 셀러 매출 5배 성장 사례 — 핵심 운영 지표',
     '저희가 컨설팅한 셀러의 6개월간 성과 개선 사례입니다. (1) Gold Supplier 등급 + Verified Supplier 인증 풀세팅, (2) 미니사이트 다국어(영·서·아랍어) 번역, (3) RFQ 24시간 이내 응답률 100%, (4) Instant Message 응답률 95% 이상 유지, (5) Trade Assurance 결제 비중 70% 달성. 알리바바 검색 알고리즘은 응답성과 거래 신뢰성을 핵심 가중치로 두므로, 운영 지표 관리가 곧 노출 경쟁력으로 연결됩니다.',
     'post_alibaba_seller.jpg',
     '2026/05/20/post/post_17.jpg'),

    ('siwoo.yang@globalgates.test',
     '딸기 수출 콜드체인 운영 매뉴얼 — 대전·인천공항·홍콩 루트',
     '신선 농산물 수출은 콜드체인의 단일 실패 지점만으로도 전 물량 손실로 이어질 수 있습니다. 당사 표준 운영은 다음과 같습니다. (1) 산지 예냉(0~2℃) 6시간 의무, (2) 인천공항 보세창고 도착 후 2시간 이내 적재, (3) 항공기내 +4℃ 정온 유지, (4) 현지 도착 후 라스트마일 냉장차량 즉시 픽업. 컨테이너 데이터로거를 부착하여 전 구간 온도 이력을 검증하는 절차가 필수입니다.',
     'post_strawberry_export.jpg',
     '2026/05/20/post/post_18.jpg'),

    ('gaeun.moon@globalgates.test',
     '의료기기 미국 진출 — 510(k)·De Novo 경로 비교',
     '미국 FDA 진출 경로는 Substantial Equivalence(SE) 입증 가능 여부로 결정됩니다. Predicate device가 존재할 경우 510(k)를 통해 평균 4~6개월 내 승인 가능하며, 신규 위험 분류 카테고리는 De Novo 경로로 10~12개월이 소요됩니다. 비용 측면에서는 510(k)가 De Novo의 약 1/3 수준이나, De Novo는 후속 510(k)의 Predicate가 되므로 시장 선점 효과 측면에서 전략적 가치를 가집니다.',
     'post_medical_fda.jpg',
     '2026/05/20/post/post_19.jpg'),

    ('seonho.baek@globalgates.test',
     '브라질 시장 진출 — ICMS·IPI 등 다층 조세구조 이해',
     '브라질은 연방세와 주(州)세가 누적되는 조세구조로, 단순 관세율만으로 수입원가를 산정하면 큰 오차가 발생합니다. 핵심 세목은 (1) II(수입관세), (2) IPI(공산품세), (3) PIS/COFINS(사회보장세), (4) ICMS(주별 부가가치세, 7~25%)입니다. 산타카타리나·에스피리투산투 주 활용 스킴이 일반적이며, 진출 단계에서 현지 세무 자문 확보가 필수적입니다.',
     'post_brazil_market.jpg',
     '2026/05/20/post/post_20.jpg'),

    ('jaeho.kim@globalgates.test',
     'AI 서버용 HBM 공급 부족 — 언제까지 지속될 것인가',
     '현재 시장 분석에 따르면 HBM 공급 부족은 최소 2027년 상반기까지 이어질 가능성이 높습니다. 엔비디아 Blackwell Ultra·Rubin 시리즈의 HBM 탑재량 증가로 단순 수요 확대보다 ASP 상승 폭이 더 크게 작용하고 있습니다. 다만 HBM4 양산이 본격화되는 시점부터 미들엔드 HBM3 가격은 빠르게 안정화될 가능성이 있어, 수요 기업은 세대별 조달 계획을 분리 운영하는 것이 합리적입니다.',
     'post_hbm_supply.jpg',
     '2026/05/20/post/post_21.jpg'),

    ('sumin.lee@globalgates.test',
     '사우디 SFDA 화장품 인증 가이드 — 등록 절차와 일정',
     '사우디 화장품 시장 진출은 SFDA 등록이 의무 사항입니다. 주요 절차는 (1) 제품 카테고리 분류(Cosmetic vs Medicinal claim 구분 주의), (2) Arabic 라벨링 필수 제작, (3) 현지 Authorized Representative 지정, (4) CPSR(안전성 보고서) 제출입니다. 평균 처리 기간은 4~6개월이며, UAE는 ECAS, 카타르는 QGSO 인증을 별도 추진해야 합니다.',
     'post_saudi_cosmetics.jpg',
     '2026/05/20/post/post_22.jpg'),

    ('seungwoo.han@globalgates.test',
     'EU CBAM 본격 시행 — 수출기업의 우선 준비사항',
     '2026년 EU CBAM 본격 부과가 시작되었습니다. 1차 대상은 철강·알루미늄·시멘트·비료·전력·수소이며, 가공품 단계로의 확대가 단계적으로 진행될 예정입니다. 수출기업은 (1) 직접·간접 탄소배출량 산정 체계 구축, (2) EU 수입자와의 배출 데이터 공유 협약 체결, (3) 제3자 검증기관 사전 선정을 우선적으로 추진해야 하며, 미준비 시 디폴트값 적용으로 인한 관세 부담이 크게 증가합니다.',
     'post_cbam.jpg',
     '2026/05/20/post/post_23.jpg'),

    ('dohyun.lim@globalgates.test',
     'LCL과 FCL 운영 손익분기점 — 부피·중량·화물특성 기준',
     '실무 경험상 화물 부피 약 15CBM이 LCL과 FCL의 손익분기점입니다. 15CBM 미만은 LCL이 유리하며, 그 이상은 20피트 컨테이너 FCL이 운임·리드타임 측면에서 모두 효율적입니다. 다만 (1) 위험화물, (2) 정온 유지가 필요한 화물, (3) 중량물(W/M 룰 적용)의 경우 부피와 무관하게 FCL을 권장합니다. LCL 선택 시 CFS 비용과 통관 지연 리스크를 단가에 반드시 반영해야 합니다.',
     'post_fcl_lcl.jpg',
     '2026/05/20/post/post_24.jpg'),

    ('yena.choi@globalgates.test',
     '의류 OEM 샘플링 단계의 핵심 리스크 3가지',
     '바이어 컨펌 이전 샘플링 단계에서 가장 빈번한 문제는 (1) 컬러 매칭(Pantone TPX vs TCX 기준 혼동), (2) 사이즈 그레이딩(아시아·유럽·미국 기준 차이), (3) 라벨링(care label 다국어, 원산지 표기 의무) 누락입니다. 골든 샘플을 명문화하여 양산의 기준으로 삼고, 구두 합의는 반드시 서면으로 재확인하는 절차가 필요합니다.',
     'post_apparel_sample.jpg',
     '2026/05/20/post/post_25.jpg')
),
inserted_posts AS (
    INSERT INTO tbl_post (member_id, post_status, title, content)
    SELECT m.id, 'active'::post_status, pd.title, pd.content
    FROM post_data pd
    JOIN tbl_member m ON m.member_email = pd.email
    RETURNING id, title
),
inserted_post_files AS (
    INSERT INTO tbl_file (original_name, file_name, file_path, file_size, content_type)
    SELECT pd.original_name, pd.s3_key, pd.s3_key, 256000, 'image'::file_content_type
    FROM post_data pd
    RETURNING id, file_path
)
INSERT INTO tbl_post_file (post_id, file_id)
SELECT ip.id, ipf.id
FROM post_data pd
JOIN inserted_posts      ip  ON ip.title      = pd.title
JOIN inserted_post_files ipf ON ipf.file_path = pd.s3_key;

-- -------------------------------------------------------------
-- [5] 해시태그
-- -------------------------------------------------------------
INSERT INTO tbl_post_hashtag (tag_name) VALUES
    ('무역'), ('수출'), ('수입'), ('FTA'), ('관세'), ('물류'), ('통관'),
    ('반도체'), ('HBM'), ('K뷰티'), ('K푸드'), ('전기차부품'), ('의류수출'),
    ('RCEP'), ('CBAM'), ('CE인증'), ('FDA'), ('HALAL'), ('HACCP'),
    ('베트남시장'), ('인도시장'), ('중동시장'), ('유럽수출'), ('미주수출'),
    ('아마존수출'), ('알리바바'), ('LC'), ('수출보험'), ('환헤지'), ('콜드체인'),
    ('부산항'), ('인천공항'), ('컨테이너운임'), ('FCL'), ('LCL'),
    ('의료기기수출'), ('화장품수출'), ('자동차부품'), ('기계장비수출'), ('석유화학')
ON CONFLICT (tag_name) DO NOTHING;

-- -------------------------------------------------------------
-- [6] 게시글 ↔ 해시태그 매핑 (제목 키워드 기반 자동 매칭)
-- -------------------------------------------------------------
INSERT INTO tbl_post_hashtag_rel (post_id, hashtag_id)
SELECT DISTINCT p.id, h.id
FROM tbl_post p
JOIN tbl_post_hashtag h ON
    (p.title LIKE '%메모리 반도체%'  AND h.tag_name IN ('반도체','수출','무역'))
 OR (p.title LIKE '%HBM%'            AND h.tag_name IN ('HBM','반도체','수출'))
 OR (p.title LIKE '%K-뷰티%'         AND h.tag_name IN ('K뷰티','화장품수출','수출'))
 OR (p.title LIKE '%사우디 SFDA%'    AND h.tag_name IN ('K뷰티','화장품수출','중동시장'))
 OR (p.title LIKE '%K-Food%'         AND h.tag_name IN ('K푸드','수출','HACCP','HALAL','FDA'))
 OR (p.title LIKE '%전기차%'         AND h.tag_name IN ('전기차부품','자동차부품','수출','CBAM'))
 OR (p.title LIKE '%친환경 원단%'    AND h.tag_name IN ('의류수출','유럽수출','수출'))
 OR (p.title LIKE '%의류 OEM 샘플링%' AND h.tag_name IN ('의류수출','수출'))
 OR (p.title LIKE '%RCEP%'           AND h.tag_name IN ('RCEP','FTA','관세'))
 OR (p.title LIKE '%CBAM%'           AND h.tag_name IN ('CBAM','수출','관세','유럽수출'))
 OR (p.title LIKE '%HS코드%'         AND h.tag_name IN ('관세','통관','수출'))
 OR (p.title LIKE '%부산·광양·인천항%' AND h.tag_name IN ('부산항','물류','컨테이너운임'))
 OR (p.title LIKE '%해상운임 동향%'  AND h.tag_name IN ('컨테이너운임','물류','FCL'))
 OR (p.title LIKE '%LCL과 FCL%'      AND h.tag_name IN ('FCL','LCL','물류'))
 OR (p.title LIKE '%Amazon US%'      AND h.tag_name IN ('아마존수출','미주수출','수출'))
 OR (p.title LIKE '%Alibaba%'        AND h.tag_name IN ('알리바바','수출'))
 OR (p.title LIKE '%신용장%'         AND h.tag_name IN ('LC','수출'))
 OR (p.title LIKE '%베트남 진출%'    AND h.tag_name IN ('베트남시장','수출','RCEP'))
 OR (p.title LIKE '%유럽 가전 바이어%' AND h.tag_name IN ('유럽수출','수출','CE인증'))
 OR (p.title LIKE '%석유화학 원료%'  AND h.tag_name IN ('석유화학','수입','환헤지'))
 OR (p.title LIKE '%동유럽 기계장비%' AND h.tag_name IN ('기계장비수출','유럽수출','CE인증'))
 OR (p.title LIKE '%K-SURE%'         AND h.tag_name IN ('수출보험','수출','환헤지'))
 OR (p.title LIKE '%딸기 수출%'      AND h.tag_name IN ('K푸드','수출','콜드체인','인천공항'))
 OR (p.title LIKE '%의료기기 미국%'  AND h.tag_name IN ('의료기기수출','FDA','수출','미주수출'))
 OR (p.title LIKE '%브라질 시장%'    AND h.tag_name IN ('수출','관세'))
ON CONFLICT DO NOTHING;

COMMIT;

-- -------------------------------------------------------------
-- 결과 확인용 쿼리 (필요 시 주석 해제)
-- -------------------------------------------------------------
-- SELECT 'members'       AS what, COUNT(*) FROM tbl_member          WHERE member_email LIKE '%@globalgates.test'
-- UNION ALL SELECT 'business',     COUNT(*) FROM tbl_business_member
-- UNION ALL SELECT 'profile_files',COUNT(*) FROM tbl_member_profile_file
-- UNION ALL SELECT 'posts',        COUNT(*) FROM tbl_post           WHERE member_id IN (SELECT id FROM tbl_member WHERE member_email LIKE '%@globalgates.test')
-- UNION ALL SELECT 'post_files',   COUNT(*) FROM tbl_post_file
-- UNION ALL SELECT 'hashtags',     COUNT(*) FROM tbl_post_hashtag
-- UNION ALL SELECT 'hashtag_rels', COUNT(*) FROM tbl_post_hashtag_rel;
