-- 관리자 계정 시드
-- 로그인 ID: admin@globalgates.com  (member_email 또는 member_phone 으로 로그인 가능)
-- 비밀번호 : 1234  (BCrypt 10라운드, 검증 완료)
-- 권한    : admin  (SecurityConfig: /admin/**, /api/admin/** 접근 허용)
-- 동일 이메일/핸들이 이미 있으면 무시한다.

INSERT INTO tbl_member (
    member_name,
    member_email,
    member_password,
    member_nickname,
    member_handle,
    member_phone,
    member_bio,
    member_region,
    member_role,
    member_status
)
VALUES (
    '관리자',
    'admin@globalgates.com',
    '$2a$10$qBTl1KlLJQ.MuuPGMNqo6.kXpPQ/WjtMeFoPihuTSolrCJ1iIgIqe',
    '관리자',
    '@admin',
    '01000000000',
    'GlobalGates 관리자 계정',
    '서울',
    'admin',
    'active'
)
ON CONFLICT (member_email) DO NOTHING;

-- 이미 admin 행이 있는 경우(이전 잘못된 해시로 들어간 케이스) 비밀번호/권한/상태를 보정
UPDATE tbl_member
SET member_password = '$2a$10$qBTl1KlLJQ.MuuPGMNqo6.kXpPQ/WjtMeFoPihuTSolrCJ1iIgIqe',
    member_role     = 'admin',
    member_status   = 'active'
WHERE member_email = 'admin@globalgates.com';
