-- =============================================
-- 더미 데이터 (테스트용)
-- 기존 데이터와 충돌하지 않도록 ON CONFLICT 처리
-- =============================================

-- [1] 회원 (비밀번호: BCrypt 인코딩된 "1234")
INSERT INTO tbl_member (member_name, member_email, member_password, member_nickname, member_handle, member_phone, member_bio, member_region, member_role)
VALUES
    ('김윤찬', 'kim@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '윤찬', '@yunchan_kim', '01012345678', '무역 전문가입니다', '서울', 'business'),
    ('이서연', 'lee@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '서연', '@seoyeon_lee', '01023456789', '15년차 수출입 컨설턴트. 한-아세안, 한-EU FTA 활용 전략 전문. 중소기업 해외진출 자문 200건 이상 수행.', '부산', 'expert'),
    ('박민수', 'park@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '민수', '@minsu_park', '01034567890', 'B2B 바이어', '대구', 'business'),
    ('정하은', 'jung@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '하은', '@haeun_jung', '01045678901', '물류 매니저', '인천', 'business'),
    ('최영호', 'choi@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '영호', '@youngho_choi', '01056789012', '관세법인 대표 관세사. HS코드 분류, 관세 환급, FTA 원산지 검증 전문. 세관 출신 경력 12년.', '서울', 'expert'),
    ('한지우', 'han@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '지우', '@jiwoo_han', '01067890123', 'FTA 전문 컨설턴트. 한-중, 한-아세안, RCEP 등 주요 협정 활용 전략 수립 및 기업 교육 진행. 원산지 관리 시스템 구축 경력 다수.', '서울', 'expert'),
    ('오세진', 'oh@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '세진', '@sejin_oh', '01078901234', '부산항만공사 출신 국제물류 전문가. 해운·항공·복합운송 최적화 컨설팅. 연간 1,000TEU 이상 물량 핸들링 경험.', '부산', 'expert'),
    ('강예린', 'kang@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '예린', '@yerin_kang', '01089012345', '해외영업 담당자', '서울', 'business'),
    ('윤태호', 'yoon@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '태호', '@taeho_yoon', '01090123456', '인천공항 인근 통관법인 소속. 수출입 통관, 보세운송, 관세 심사 대응 전문. 전자제품·화장품 품목 특화.', '인천', 'expert'),
    ('서다은', 'seo@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '다은', '@daeun_seo', '01001234567', '식품 수출 전문가. HACCP·FDA·HALAL 인증 컨설팅 전문. 일본·동남아향 K-Food 수출 프로젝트 50건 이상 수행.', '대전', 'expert'),
    ('임재현', 'lim@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '재현', '@jaehyun_lim', '01012345670', '화장품 해외유통', '서울', 'business'),
    ('송민아', 'song@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '민아', '@mina_song', '01023456780', '원산지 증명 전문가. 원산지 관리사 자격 보유. FTA 원산지 판정·증명서 발급·사후검증 대응 전문. 섬유·의류 업종 특화.', '광주', 'expert'),
    ('배준서', 'bae@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '준서', '@junseo_bae', '01034567891', '자동차부품 수출', '울산', 'business'),
    ('조은비', 'jo@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '은비', '@eunbi_jo', '01045678902', '전자제품 글로벌 소싱 전문 바이어. 삼성·LG 협력사 연결 및 ODM/OEM 매칭. 유럽·중동 시장 네트워크 보유.', '수원', 'expert'),
    ('황서준', 'hwang@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '서준', '@seojun_hwang', '01056789013', '섬유 수입 전문가. 인도·방글라데시·베트남 원단 소싱 10년 경력. 면직물·합성섬유·기능성 원단 전문. 연간 500만 야드 이상 거래.', '대구', 'expert'),
    ('문하영', 'moon@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '하영', '@hayoung_moon', '01067890124', '에너지 무역 분석가. 태양광·풍력 설비 수출입 시장 분석 전문. 한국에너지공단 자문위원. ESG 무역 트렌드 리포트 발간.', '서울', 'expert'),
    ('권도윤', 'kwon@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '도윤', '@doyoon_kwon', '01078901235', '플라스틱 원료 수입', '인천', 'business'),
    ('신유나', 'shin@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '유나', '@yuna_shin', '01089012346', '의류 수출 MD. 유럽·일본 SPA 브랜드 OEM 수출 8년차. 친환경 소재 트렌드 분석 및 바이어 매칭 전문.', '서울', 'expert'),
    ('양지호', 'yang@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '지호', '@jiho_yang', '01090123457', '기계장비 수출입', '창원', 'business'),
    ('노수빈', 'noh@test.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq', '수빈', '@subin_noh', '01001234568', '반도체 수출 전문가. 메모리·비메모리 반도체 수출 규제 대응 및 미국 EAR 컴플라이언스 컨설팅. 화성 반도체 클러스터 네트워크.', '화성', 'expert')
ON CONFLICT (member_email) DO NOTHING;

-- [2] 카테고리 (대분류)
INSERT INTO tbl_category (category_name)
VALUES ('전자제품'), ('식품'), ('의류'), ('기계/부품'), ('화학/소재')
ON CONFLICT (category_name) DO NOTHING;

-- [3] 카테고리 (소분류)
INSERT INTO tbl_category (product_category_parent_id, category_name)
VALUES
    ((SELECT id FROM tbl_category WHERE category_name = '전자제품'), '반도체'),
    ((SELECT id FROM tbl_category WHERE category_name = '전자제품'), '디스플레이'),
    ((SELECT id FROM tbl_category WHERE category_name = '식품'), '수산물'),
    ((SELECT id FROM tbl_category WHERE category_name = '식품'), '농산물'),
    ((SELECT id FROM tbl_category WHERE category_name = '의류'), '원단'),
    ((SELECT id FROM tbl_category WHERE category_name = '기계/부품'), '자동차부품'),
    ((SELECT id FROM tbl_category WHERE category_name = '화학/소재'), '플라스틱원료')
ON CONFLICT (category_name) DO NOTHING;

-- [4] 일반 게시글
INSERT INTO tbl_post (member_id, post_status, title, content)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active'::post_status, '2026년 무역 동향', '올해 상반기 수출입 동향을 정리해봤습니다. 반도체 수출이 전년 대비 15% 증가했네요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active'::post_status, '관세율 변경 안내', '4월부터 적용되는 새로운 관세율 변경 사항을 공유합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'park@test.com'), 'active'::post_status, 'B2B 파트너 찾습니다', '동남아 지역 바이어 연결해주실 분 계실까요?'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active'::post_status, '수출 서류 체크리스트', '수출 초보자를 위한 필수 서류 체크리스트를 만들었습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'jung@test.com'), 'active'::post_status, '물류비 절감 팁', '최근 해상운임이 많이 올랐는데, 절감할 수 있는 방법 공유합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active'::post_status, 'FTA 활용 가이드', 'FTA 원산지 증명서 발급 절차와 주의사항을 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active'::post_status, '수입 통관 절차', '수입 통관 시 자주 발생하는 실수와 해결법을 알려드립니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'park@test.com'), 'active'::post_status, '해외 전시회 후기', '지난주 다녀온 광저우 캔톤페어 후기입니다. 올해 트렌드가 확 바뀌었어요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'jung@test.com'), 'active'::post_status, '환율 전망', '최근 원달러 환율 동향과 하반기 전망을 분석해봤습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active'::post_status, 'HS코드 분류 꿀팁', 'HS코드 분류가 어려우신 분들을 위한 실전 가이드입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active'::post_status, '신규 바이어 미팅 후기', '일본 바이어와의 첫 미팅을 다녀왔습니다. 좋은 반응이었어요!'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active'::post_status, '수출 보험 활용법', '수출 보험 가입 시 알아야 할 핵심 포인트를 정리했습니다.');

-- [4-2] 추가 게시글 (무한스크롤 + 광고 삽입 테스트용)
INSERT INTO tbl_post (member_id, post_status, title, content)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'han@test.com'), 'active'::post_status, 'FTA 활용 실전 사례', 'FTA를 활용해 관세를 절감한 실전 사례를 공유합니다. 한-아세안 FTA가 특히 유용했습니다. 베트남향 수출에서 관세율이 기존 8%에서 0%로 줄었고, 연간 약 2억원의 비용 절감 효과가 있었습니다. 원산지 증명서 발급이 핵심인데, C/O 발급 시 HS코드 매칭에 주의해야 합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'oh@test.com'), 'active'::post_status, '부산항 물류 현황', '부산항 컨테이너 물동량이 전월 대비 8% 증가했습니다. 성수기 대비 필요합니다. 특히 신항 3부두 적체가 심해지고 있어서, 출항 3일 전까지 컨테이너 반입을 완료하는 것이 좋겠습니다. 트럭 운송 예약도 미리미리 잡아두세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kang@test.com'), 'active'::post_status, '베트남 시장 진출기', '베트남 호치민에서 첫 바이어 미팅을 마쳤습니다. 현지 반응이 좋았어요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'), 'active'::post_status, '통관 지연 대처법', '최근 통관 지연이 잦아지고 있습니다. 사전 서류 준비가 핵심입니다. 특히 HS코드 사전심사를 받아두면 통관 시간을 크게 줄일 수 있어요. 관세청 UNI-PASS에서 온라인으로 신청 가능합니다. 또한 AEO 인증 업체는 우선 통관 혜택이 있으니 장기적으로 인증 취득을 고려해보세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'seo@test.com'), 'active'::post_status, '식품 수출 인증 가이드', 'HACCP, FDA 인증 절차를 정리했습니다. 식품 수출 준비하시는 분 참고하세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lim@test.com'), 'active'::post_status, 'K-뷰티 수출 동향', '한국 화장품 수출이 동남아에서 급성장 중입니다. 올해 30% 증가 전망. 태국, 베트남, 인도네시아가 주요 시장이고, 특히 스킨케어 카테고리에서 한국 브랜드 점유율이 꾸준히 올라가고 있습니다. 현지 인플루언서 마케팅과 이커머스 채널 전략이 성공 핵심입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'song@test.com'), 'active'::post_status, '원산지 증명서 발급 팁', '원산지 증명서 발급 시 자주 하는 실수와 해결 방법을 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'bae@test.com'), 'active'::post_status, '자동차부품 수출 전략', '현대·기아 협력사 부품 수출 시 알아야 할 핵심 포인트입니다. 1차 벤더 등록 절차, 품질 인증(IATF 16949) 요건, 납품 단가 협상 전략까지 실무에서 겪은 경험을 바탕으로 상세히 공유합니다. 특히 해외 CKD 공장 납품은 물류비 산정이 까다로우니 주의하세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'jo@test.com'), 'active'::post_status, '전자제품 바이어 찾기', '유럽 전자제품 바이어를 찾고 있습니다. 관심 있으신 분 연락주세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'), 'active'::post_status, '섬유 수입 시장 분석', '인도산 면직물 수입 단가가 하락 추세입니다. 좋은 타이밍일 수 있어요. 현재 파운드당 0.85달러 수준인데, 작년 같은 시기 대비 12% 저렴합니다. 다만 인도 정부의 수출 보조금 정책 변동 가능성이 있으니 장기 계약보다는 분할 발주를 추천합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'moon@test.com'), 'active'::post_status, '에너지 무역 트렌드', '신재생 에너지 관련 무역이 급성장 중입니다. 태양광 패널 수출이 주도.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kwon@test.com'), 'active'::post_status, '플라스틱 원료 시세', '석유화학 원료 가격이 안정세를 보이고 있습니다. 하반기 전망도 긍정적.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'shin@test.com'), 'active'::post_status, '의류 수출 시즌 준비', 'S/S 시즌 수출 준비가 한창입니다. 올해 트렌드는 친환경 소재. 오가닉 코튼과 리사이클 폴리에스터 수요가 급증하고 있고, 유럽 바이어들은 OEKO-TEX 인증을 기본으로 요구합니다. 샘플 제작 시 원단 성적서를 반드시 첨부하세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'yang@test.com'), 'active'::post_status, '기계장비 해외 입찰', '중동 건설장비 입찰에 참여했습니다. 경쟁이 치열하지만 가능성 있어요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'noh@test.com'), 'active'::post_status, '반도체 수출 규제 업데이트', '미국의 반도체 수출 규제가 또 강화됐습니다. 대응 전략을 정리했어요. 이번 규제는 14nm 이하 공정 장비에 대한 제3국 수출까지 포함됩니다. 우리 기업들은 미국 BIS의 사전허가를 반드시 받아야 하며, 위반 시 최대 30만 달러 벌금과 거래 제한이 부과됩니다. 법무팀과 사전 검토가 필수입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'active'::post_status, 'LC 개설 실무 가이드', '신용장(LC) 개설부터 네고까지 실무 프로세스를 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lee@test.com'), 'active'::post_status, '수출 바우처 활용법', '중소기업 수출 바우처 신청 방법과 활용 팁을 공유합니다. 올해 지원 한도가 1억원으로 늘었고, 해외 마케팅·물류·인증 비용에 사용 가능합니다. 신청은 종합무역지원센터 홈페이지에서 가능하며, 매년 3월과 9월에 모집합니다. 서류 준비가 좀 번거롭지만 활용도가 매우 높아요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'park@test.com'), 'active'::post_status, '인도 시장 공략법', '인도 바이어와 거래 시 알아야 할 문화적 차이와 협상 팁입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'jung@test.com'), 'active'::post_status, '냉동 물류 체인', '냉동식품 수출 시 콜드체인 구축 방법과 비용 절감 노하우입니다. 컨테이너 온도 설정, 사전 냉각(Pre-cooling) 시간, 현지 도착 후 라스트마일 배송까지 전 과정을 정리했습니다. 동남아 수출 시에는 현지 냉장창고 확보가 가장 중요합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'choi@test.com'), 'active'::post_status, 'HS코드 변경 안내', '2026년 하반기 HS코드 개정 사항을 정리했습니다. 꼭 확인하세요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'han@test.com'), 'active'::post_status, '한-EU FTA 혜택', '한-EU FTA로 절감 가능한 관세율과 대상 품목을 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'oh@test.com'), 'active'::post_status, '항공화물 운임 동향', '항공화물 운임이 3개월 연속 하락세입니다. 긴급 출하에 유리한 시점.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kang@test.com'), 'active'::post_status, '중국 광저우 전시회 준비', '다음 달 광저우 전시회 참가 준비 체크리스트를 공유합니다. 부스 디자인, 카탈로그 인쇄, 통역 섭외, 샘플 통관까지 2주 전에는 모두 완료되어야 합니다. 현지 숙소는 전시장 근처가 비싸지만 이동 시간을 생각하면 투자할 가치가 있습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'yoon@test.com'), 'active'::post_status, '전자상거래 수출 가이드', '아마존·쇼피를 통한 B2C 수출 시작하는 방법을 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'seo@test.com'), 'active'::post_status, '농산물 검역 절차', '농산물 수출 시 검역 절차와 필요 서류를 상세히 정리했습니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'lim@test.com'), 'active'::post_status, '화장품 성분 규제', 'EU REACH 규정 변경으로 화장품 수출 시 주의할 성분 목록입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'song@test.com'), 'active'::post_status, '무역보험 가입 후기', '무역보험공사 수출보험 가입 경험을 공유합니다. 생각보다 간편해요.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'bae@test.com'), 'active'::post_status, 'EV 부품 수출 급증', '전기차 배터리·모터 부품 수출이 전년 대비 40% 증가했습니다. 특히 유럽의 전기차 전환 정책에 따라 배터리 셀, BMS, 구동모터 수요가 폭발적입니다. 국내 2차전지 소재 기업들의 수출 실적도 역대 최고를 기록 중이며, 헝가리·폴란드 현지 공장 납품도 활발합니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'jo@test.com'), 'active'::post_status, '리퍼 제품 수출 시장', '리퍼비시 전자제품 동남아 수출이 새로운 블루오션입니다.'),
    ((SELECT id FROM tbl_member WHERE member_email = 'hwang@test.com'), 'active'::post_status, '친환경 포장재 트렌드', '유럽 수출 시 친환경 포장재 요구가 강화되고 있습니다. 대비하세요.');

-- [5] 해시태그
INSERT INTO tbl_post_hashtag (tag_name)
VALUES ('무역'), ('수출'), ('수입'), ('반도체'), ('FTA'),
       ('물류'), ('관세'), ('B2B'), ('해외전시회'), ('환율'),
       ('식품'), ('원단'), ('자동차부품'), ('친환경'), ('프리미엄')
ON CONFLICT (tag_name) DO NOTHING;

-- [6] 게시글-해시태그 연결
-- ※ 서브쿼리로 ID를 동적으로 가져옴 (하드코딩 ID 제거)
INSERT INTO tbl_post_hashtag_rel (post_id, hashtag_id)
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '2026년 무역 동향' AND h.tag_name = '무역'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '2026년 무역 동향' AND h.tag_name = '수출'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '관세율 변경 안내' AND h.tag_name = '관세'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '관세율 변경 안내' AND h.tag_name = '수입'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = 'B2B 파트너 찾습니다' AND h.tag_name = 'B2B'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = 'B2B 파트너 찾습니다' AND h.tag_name = '무역'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '물류비 절감 팁' AND h.tag_name = '물류'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '물류비 절감 팁' AND h.tag_name = '수출'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = 'FTA 활용 가이드' AND h.tag_name = 'FTA'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = 'FTA 활용 가이드' AND h.tag_name = '관세'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '해외 전시회 후기' AND h.tag_name = '해외전시회'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '해외 전시회 후기' AND h.tag_name = 'B2B'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '환율 전망' AND h.tag_name = '환율'
UNION ALL
SELECT p.id, h.id FROM tbl_post p, tbl_post_hashtag h
WHERE p.title = '환율 전망' AND h.tag_name = '무역';

-- [7] 좋아요
INSERT INTO tbl_post_like (member_id, post_id)
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'lee@test.com' AND p.title = '2026년 무역 동향'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'park@test.com' AND p.title = '2026년 무역 동향'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'jung@test.com' AND p.title = '2026년 무역 동향'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'kim@test.com' AND p.title = '관세율 변경 안내'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'park@test.com' AND p.title = '관세율 변경 안내'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'lee@test.com' AND p.title = '물류비 절감 팁'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'park@test.com' AND p.title = '물류비 절감 팁'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'kim@test.com' AND p.title = '해외 전시회 후기'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'lee@test.com' AND p.title = '해외 전시회 후기'
UNION ALL
SELECT m.id, p.id FROM tbl_member m, tbl_post p WHERE m.member_email = 'jung@test.com' AND p.title = '해외 전시회 후기';


-- [8] 팔로우
INSERT INTO tbl_follow (follower_id, following_id)
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'kim@test.com' AND m2.member_email = 'lee@test.com'
UNION ALL
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'kim@test.com' AND m2.member_email = 'choi@test.com'
UNION ALL
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'lee@test.com' AND m2.member_email = 'kim@test.com'
UNION ALL
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'park@test.com' AND m2.member_email = 'kim@test.com'
UNION ALL
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'park@test.com' AND m2.member_email = 'lee@test.com'
UNION ALL
SELECT m1.id, m2.id FROM tbl_member m1, tbl_member m2 WHERE m1.member_email = 'choi@test.com' AND m2.member_email = 'kim@test.com';

-- [9] 댓글
INSERT INTO tbl_post (member_id, post_status, title, content, reply_post_id)
SELECT m.id, 'active'::post_status, '', '정말 유용한 정보네요! 감사합니다.', p.id
FROM tbl_member m, tbl_post p WHERE m.member_email = 'lee@test.com' AND p.title = '2026년 무역 동향'
UNION ALL
SELECT m.id, 'active'::post_status, '', '반도체 수출 증가 추세가 계속될까요?', p.id
FROM tbl_member m, tbl_post p WHERE m.member_email = 'park@test.com' AND p.title = '2026년 무역 동향'
UNION ALL
SELECT m.id, 'active'::post_status, '', '좋은 정보 감사합니다. 관세율 표도 같이 올려주시면 좋겠어요.', p.id
FROM tbl_member m, tbl_post p WHERE m.member_email = 'kim@test.com' AND p.title = '관세율 변경 안내'
UNION ALL
SELECT m.id, 'active'::post_status, '', '동남아 바이어 연결 가능합니다. DM 주세요!', p.id
FROM tbl_member m, tbl_post p WHERE m.member_email = 'choi@test.com' AND p.title = 'B2B 파트너 찾습니다'
UNION ALL
SELECT m.id, 'active'::post_status, '', '해상운임 절감 팁 너무 좋아요. DM 드려도 될까요?', p.id
FROM tbl_member m, tbl_post p WHERE m.member_email = 'jung@test.com' AND p.title = '물류비 절감 팁';

-- [10] 뉴스
INSERT INTO tbl_news (admin_id, news_title, news_content, news_source_url, news_category, news_type)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), '2026년 상반기 수출 역대 최고치 경신', '산업통상자원부에 따르면 2026년 상반기 수출액이 전년 동기 대비 12.3% 증가한 3,450억 달러를 기록했다.', 'https://example.com/news/1', 'trade', 'general'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'EU, 탄소국경조정제도(CBAM) 본격 시행', '유럽연합이 탄소국경조정제도를 본격 시행하면서 철강, 알루미늄, 시멘트 등 탄소 집약 산업의 수출 기업들이 대비에 나서고 있다.', 'https://example.com/news/2', 'policy', 'general'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), '원달러 환율 1,350원대 안정세', '원달러 환율이 1,350원대에서 안정적인 흐름을 보이고 있다.', 'https://example.com/news/3', 'market', 'general');

-- [11] 광고
INSERT INTO tbl_advertisement (advertiser_id, title, headline, description, landing_url, budget, impression_estimate, status)
VALUES
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), '무역 플랫폼 광고', 'GlobalGates Premium', '글로벌 무역을 더 스마트하게! GlobalGates 프리미엄으로 업그레이드하고 맞춤 바이어 매칭, 실시간 환율 알림, 전문가 1:1 상담을 이용하세요.', 'https://globalgates.com/premium', 500000, 10000, 'active'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), '물류 서비스 광고', '해운 운임 최대 30% 절감', '컨테이너 물류비가 부담되시나요? TradeShip과 함께하면 부산항·인천항 출발 해운 운임을 최대 30%까지 절감할 수 있습니다. 지금 무료 견적을 받아보세요.', 'https://tradeship.co.kr/quote', 300000, 5000, 'active'),
    ((SELECT id FROM tbl_member WHERE member_email = 'kim@test.com'), 'FTA 컨설팅 광고', 'FTA 관세 절감, 놓치고 계신가요?', '매년 수천만 원의 관세를 더 내고 계실 수 있습니다. FTA 전문 컨설턴트가 귀사의 수출입 품목을 분석하고 최적의 절감 전략을 제안해 드립니다.', 'https://fta-consulting.kr', 200000, 3000, 'active');

-- [12] 검색 기록 (memberId=6 기준)
INSERT INTO tbl_search_history (member_id, search_keyword, search_count)
VALUES
    (6, '반도체 수출', 3),
    (6, 'FTA 원산지', 2),
    (6, '동남아 바이어', 1),
    (6, '환율 전망', 5),
    (6, '해상운임', 1);


INSERT INTO tbl_post (member_id, post_status, title, content)
VALUES (41, 'active', '프리미엄 원두 커피 1kg', '에티오피아 예가체프 싱글오리진. 미디엄 로스팅, 산미와과일향이 풍부합니다.'),
 (41, 'active', '스테인리스 텀블러 500ml', '이중 진공 단열 구조. 보온 12시간, 보냉 24시간. BPA
Free.');

INSERT INTO tbl_post_product (id, product_price, product_stock)
SELECT p.id, 18000, 100
FROM tbl_post p WHERE p.member_id = 41 AND p.title = '스테인리스 텀블러 500ml';


