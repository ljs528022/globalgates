-- ============================================================
-- Friends 카테고리 필터 테스트용 더미 데이터
-- 실행 전: tbl_member, tbl_category 데이터가 존재해야 합니다
-- 비밀번호: 모두 1234 (BCrypt)
-- ============================================================

-- 1. 회원 30명 추가
insert into tbl_member (member_name, member_email, member_password, member_nickname, member_handle, member_bio, member_role)
values
    ('김수출', 'export_kim@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '수출왕김사장', '@export_kim', '미주 수출 전문 20년 경력', 'business'),
    ('이유럽', 'europe_lee@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '유럽무역이대표', '@europe_lee', '유럽 시장 개척 전문가', 'expert'),
    ('박동남아', 'sea_park@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '동남아전문박과장', '@sea_park', '베트남·태국 수출입', 'business'),
    ('최중국', 'china_choi@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '차이나트레이드최', '@china_choi', '중국 수출입 10년', 'business'),
    ('정일본', 'japan_jung@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '일본무역정대리', '@japan_jung', '일본 시장 전문', 'business'),
    ('강수입', 'import_kang@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '원자재수입강팀장', '@import_kang', '원자재 수입 전문', 'business'),
    ('윤완제품', 'product_yoon@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '완제품전문윤사장', '@product_yoon', '완제품 수입 유통', 'expert'),
    ('임전자', 'elec_lim@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '전자부품임대표', '@elec_lim', '반도체·전자부품 수입', 'business'),
    ('한해운', 'ship_han@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '해운물류한과장', '@ship_han', '부산항 해운 물류 전문', 'business'),
    ('서항공', 'air_seo@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '항공물류서대리', '@air_seo', '인천공항 항공 화물', 'business'),
    ('오창고', 'ware_oh@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '스마트창고오매니저', '@ware_oh', '물류 창고 관리', 'business'),
    ('조관세', 'customs_jo@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '관세사조선생', '@customs_jo', 'FTA·관세 컨설팅 15년', 'expert'),
    ('권통관', 'clear_kwon@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '통관전문권대리', '@clear_kwon', '수출입 통관 대행', 'business'),
    ('유환급', 'refund_yu@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '환급전문유팀장', '@refund_yu', '관세 환급 전문', 'business'),
    ('신금융', 'fin_shin@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '무역금융신매니저', '@fin_shin', '무역 금융·LC 전문', 'expert'),
    ('장환율', 'fx_jang@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '환율분석장연구원', '@fx_jang', '환율 리스크 관리', 'business'),
    ('문보험', 'ins_moon@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '무역보험문설계사', '@ins_moon', '적하보험·무역보험', 'business'),
    ('배플랫폼', 'plat_bae@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'IT무역플랫폼배CTO', '@plat_bae', 'B2B 무역 플랫폼 개발', 'business'),
    ('송자동화', 'auto_song@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '자동화솔루션송대표', '@auto_song', '무역 자동화 시스템', 'expert'),
    ('노블록체인', 'block_no@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '블록체인무역노연구', '@block_no', '블록체인 기반 무역 인증', 'business'),
    ('하농산', 'farm_ha@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '농산물수출하사장', '@farm_ha', '농산물 수출 전문', 'business'),
    ('구수산', 'fish_gu@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '수산물무역구대표', '@fish_gu', '수산물 수출입', 'business'),
    ('피가공', 'proc_pi@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '가공식품피매니저', '@proc_pi', 'K-Food 해외 유통', 'business'),
    ('마화장', 'cosm_ma@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'K뷰티마대표', '@cosm_ma', 'K-Beauty 해외 수출', 'expert'),
    ('차자동차', 'car_cha@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '자동차부품차팀장', '@car_cha', '자동차 부품 수출', 'business'),
    ('태섬유', 'textile_tae@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '섬유의류태사장', '@textile_tae', '섬유·의류 OEM 수출', 'business'),
    ('곽기계', 'mach_gwak@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '기계장비곽엔지니어', '@mach_gwak', '산업 기계 수출', 'expert'),
    ('남에너지', 'energy_nam@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '에너지무역남이사', '@energy_nam', '에너지·원유 트레이딩', 'business'),
    ('홍중동', 'mid_hong@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '중동전문홍부장', '@mid_hong', '중동 건설·플랜트 수출', 'business'),
    ('류HS코드', 'hs_ryu@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'HS코드분류류관세사', '@hs_ryu', 'HS코드 품목분류 전문', 'expert');

-- 2. 회원-카테고리 관계 (카테고리 ID 기준)
-- 카테고리 ID 참고:
-- 대분류: 1수출 2수입 3물류 4관세 5금융 6IT 7식품 8화장품 9자동차 10섬유/의류 11기계/장비 12에너지
-- 소분류: 13미주 14유럽 15동남아 16중국 17일본 18중동
--         19원자재 20완제품 21식품(수입) 22전자부품
--         23해운 24항공 25육상 26창고
--         27FTA 28HS코드 29통관 30환급
--         31무역금융 32환율 33보험 34LC
--         35플랫폼 36자동화 37블록체인
--         38농산물 39수산물 40가공식품 41건강식품

-- email 기준으로 member_id를 조회하여 insert
insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'export_kim@test.com' and c.category_name = '미주';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'europe_lee@test.com' and c.category_name = '유럽';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'sea_park@test.com' and c.category_name = '동남아';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'china_choi@test.com' and c.category_name = '중국';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'japan_jung@test.com' and c.category_name = '일본';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'import_kang@test.com' and c.category_name = '원자재';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'product_yoon@test.com' and c.category_name = '완제품';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'elec_lim@test.com' and c.category_name = '전자부품';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'ship_han@test.com' and c.category_name = '해운';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'air_seo@test.com' and c.category_name = '항공';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'ware_oh@test.com' and c.category_name = '창고';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'customs_jo@test.com' and c.category_name = 'FTA';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'clear_kwon@test.com' and c.category_name = '통관';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'refund_yu@test.com' and c.category_name = '환급';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'fin_shin@test.com' and c.category_name = '무역금융';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'fx_jang@test.com' and c.category_name = '환율';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'ins_moon@test.com' and c.category_name = '보험';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'plat_bae@test.com' and c.category_name = '플랫폼';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'auto_song@test.com' and c.category_name = '자동화';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'block_no@test.com' and c.category_name = '블록체인';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'farm_ha@test.com' and c.category_name = '농산물';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'fish_gu@test.com' and c.category_name = '수산물';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'proc_pi@test.com' and c.category_name = '가공식품';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'cosm_ma@test.com' and c.category_name = '화장품';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'car_cha@test.com' and c.category_name = '자동차';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'textile_tae@test.com' and c.category_name = '섬유/의류';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'mach_gwak@test.com' and c.category_name = '기계/장비';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'energy_nam@test.com' and c.category_name = '에너지';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'mid_hong@test.com' and c.category_name = '중동';

insert into tbl_member_category_rel (member_id, category_id)
select m.id, c.id from tbl_member m, tbl_category c
where m.member_email = 'hs_ryu@test.com' and c.category_name = 'HS코드';
