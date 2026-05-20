-- [1] tbl_address  ─ 주소 공통 슈퍼타입
--     하위 테이블: tbl_member_address, tbl_partner_address

create table tbl_address (
id          bigint      generated always as identity primary key,  -- pk | 주소 고유 id (자동 증가)
postal_code varchar(255)  not null,                                  -- 우편번호 (예: 06236)
country     varchar(255) not null,                                  -- 국가명 (기본값: korea)
country_code varchar(255)  not null,                                  -- 국가코드
address1    varchar(255)  not null,                                  -- 기본 주소 (시/도, 구/군, 도로명)
address2    varchar(255),                                           -- 상세 주소 (동·호수, 층 등 선택)
city        varchar(255),                                           -- 도시명
created_datetime  timestamp    not null default now(),
updated_datetime  timestamp    not null default now(),
constraint fk_address_member foreign key (id)
references tbl_member(id)
);

-- [2] tbl_file  ─ 파일 공통
--     하위 테이블: tbl_post_file, tbl_member_profile_file,
--                tbl_chat_file, tbl_partner_logo_file,
--                tbl_estimation_file, tbl_news_file, tbl_ad_file

-- 파일 콘텐츠 유형
alter type file_content_type add value 'audio';
create type file_content_type as enum (
'image',        -- 이미지 (jpg, png, webp 등)
'video',        -- 동영상
'document',     -- 문서 (pdf, docx 등)
'audio',        -- 녹음파일
'etc'           -- 기타
);

select * from tbl_file;
create table tbl_file (
id            bigint             generated always as identity primary key,  -- pk | 파일 고유 id (자동 증가)
original_name varchar(255)       not null,                                  -- 사용자가 업로드한 원본 파일명
file_name   varchar(255)       not null,                                     -- 서버 저장 파일명 (uuid 변환)
file_path     varchar(255)       not null,                                  -- 파일 접근 경로 (로컬 또는 cdn url)
file_size     bigint             not null default 0,                        -- 파일 크기 (단위: byte)
content_type  file_content_type  not null default 'image',                    -- 파일 콘텐츠 유형 (enum)
created_datetime    timestamp          not null default now()                     -- 파일 업로드 일시
);

-- [3] tbl_member  ─ 회원

-- 회원 계정 상태
create type member_status as enum (
'active',      -- 정상
'inactive',     -- 탈퇴
'banned'       -- 정지
);

-- 회원 역할
create type member_role as enum (
'business',     -- 사업 회원
'expert',       -- 전문가 회원
'admin'         -- 관리자
);

-- 1. member_name 컬럼 추가
alter table tbl_member
add column member_name varchar(255);

-- 2. member_nickname의 not null 제거
alter table tbl_member
alter column member_nickname drop not null;

-- 3. member_handle에 not null 추가
--    (기존 데이터에 null이 있으면 에러 발생 → 먼저 확인/처리 필요)
alter table tbl_member
alter column member_handle set not null;
-- 수정사항: member_name 컬럼 추가, nickname에 not null제거, handle에 not null 추가.

-- 3/23일 수정사항
alter table tbl_member add member_language varchar(255);
alter table tbl_member
alter column member_email drop not null;
alter table tbl_member
add constraint member_email_unique unique (member_email);
alter table tbl_member add member_login_verified boolean default true;

create table tbl_member (
id            bigint        generated always as identity primary key,  -- pk | 회원 고유 id (자동 증가)
member_name varchar(255),
member_email         varchar(255)  unique,                           -- 로그인 이메일 (unique)
member_password      varchar(255),                                            -- 해시된 비밀번호 (oauth 전용이면 null)
member_nickname      varchar(255),                                  -- 닉네임 (화면 표시용)
member_handle        varchar(255)   unique not null,                                    -- @핸들 - 마이페이지 url 구분자 (unique)
member_phone         varchar(255),                                             -- 연락처
member_bio           text,                                                    -- 자기소개 / 프로필 설명 (mypage description)
member_region        varchar(255),                                            -- 활동 지역 (mypage 표시)
member_login_verified boolean default true,
member_status        member_status not null default 'active', -- 계정 상태 (enum)
member_role          member_role   not null default 'business',           -- 회원 역할 (enum)
push_enabled     boolean       not null default true,                       -- 푸시 알림 허용 (join-modal-notification)
member_language      varchar(255),                                              -- 웹사이트 URL (mypage 프로필 편집)
birth_date       varchar(255),                                              -- 생년월일 (YYYYMMDD, join-modal)
member_country varchar(255),
created_datetime    timestamp     not null default now(),                    -- 가입 일시
updated_datetime    timestamp     not null default now(),                    -- 회원 정보 최종 수정 일시
last_login_at timestamp                                                -- 마지막 로그인 일시
);
select * from tbl_member;
alter table tbl_member add website_url varchar(255);
-- [4] tbl_business_member  ─ 사업회원 확장 (1:1 → tbl_member)
--     pk = fk → id 패턴 (상속 구조)
select * from tbl_member;

create table tbl_business_member (
id              bigint       primary key,
business_number varchar(255)  not null unique,  -- 사업자 등록번호 (unique)
company_name    varchar(255) not null,          -- 법인/상호명
ceo_name        varchar(255)  not null,          -- 대표자 성명
business_type   varchar(255),                  -- 업종 (예: 제조업, 도소매업)
created_datetime      timestamp    not null default now(),  -- 기업 정보 등록 일시
updated_datetime      timestamp    not null default now(),
constraint fk_business_member_member foreign key (id)
references tbl_member(id)
);

-- [5] tbl_oauth  ─ oauth 인증 정보 (1:1 → tbl_member)
-- oauth 공급자
create type oauth_provider as enum (
'kakao',
'facebook',
'naver',
'google'
);
create table tbl_oauth (
id               bigint         generated always as identity primary key,
provider_id varchar(255) unique not null,          -- 공급자 측 고유 사용자 식별자
provider         oauth_provider not null,          -- oauth 공급자 (enum: kakao/facebook/naver)
profile_url varchar(255),
member_id        bigint         not null,          -- fk → tbl_member.id | 연결된 회원
created_datetime timestamp      not null default now(),
updated_datetime timestamp default now(),
constraint fk_oauth_member foreign key (member_id)
references tbl_member(id)
);


-- [6] tbl_member_profile_file  ─ 프로필 이미지 (1:1 → tbl_file)

create type profile_type as enum (
'profile',
'banner'
);
create table tbl_member_profile_file (
id        bigint not null primary key,
member_id bigint not null,
profile_image_type profile_type default 'profile',
constraint fk_file_member_profile_file foreign key(id)
references tbl_file(id) ,
constraint fk_file_member foreign key(member_id)
references tbl_member(id)
);


-- [8] tbl_category  ─ 관심 품목 카테고리

create table tbl_category (
id            bigint           generated always as identity primary key,  -- pk | 카테고리 고유 id (자동 증가)
product_category_parent_id   bigint,          -- 상품 카테고리 대분류
category_name varchar(255)     not null,   -- 카테고리 표시명
created_datetime    timestamp        not null default now(),
constraint fk_product_category_parent_id_category foreign key(product_category_parent_id)
references tbl_category(id)
);


--3/17일


-- [9] tbl_member_category_rel  ─ 회원 ↔ 카테고리 (n:n)
drop table tbl_member_category_rel;

create table tbl_member_category_rel (
id bigint generated always as identity primary key,
member_id   bigint not null,  -- fk → tbl_member.id
category_id bigint not null,  -- fk → tbl_category.id
constraint fk_member_category_rel_member foreign key(member_id)
references tbl_member(id),
constraint fk_member_category_rel_category foreign key(category_id)
references tbl_category(id)
);

-- -- [9] tbl_member_category_rel  ─ 회원 ↔ 카테고리 (n:n)
--
-- create table tbl_member_category_rel (
-- member_id   bigint not null,  -- fk → tbl_member.id
-- category_id bigint not null,  -- fk → tbl_category.id
-- primary key (member_id, category_id),
-- constraint fk_member_category_rel_member foreign key(member_id)
-- references tbl_member(id),
-- constraint fk_member_category_rel_category foreign key(category_id)
-- references tbl_category(id)
-- );
alter table tbl_member add member_language varchar(255);
alter table tbl_member
    alter column member_email drop not null;
ALTER TABLE tbl_member
    ADD CONSTRAINT member_email_unique UNIQUE (member_email);



-- [12] tbl_post  ─ 게시글 (피드 / 상품 / 견적 등 통합)
-- 게시글 활성 상태
create type post_status as enum (
'active',       -- 정상
'inactive'      -- 삭제됨
);


alter table tbl_post
alter column title drop not null;
ALTER TABLE tbl_post ADD COLUMN IF NOT EXISTS product_id bigint;
-- 게시글 (게시물 + 댓글 대댓글 : reply_post_id)
create table tbl_post (
id             bigint          generated always as identity primary key,  -- pk | 게시글 고유 id (자동 증가)
member_id      bigint          not null,  -- fk → tbl_member.id | 게시글 작성자
post_status    post_status     not null default 'active',        -- 게시 상태 (enum)
title          varchar(255),                            -- 게시글 제목 (상품/문의글에 주로 사용)
content        text            not null,                         -- 게시글 본문 내용
location       varchar(255),                                     -- 위치 태그 (post-detailed 페이지 표시)
reply_post_id  bigint,
product_id bigint,
created_datetime     timestamp       not null default now(),
updated_datetime     timestamp       not null default now(),
constraint fk_post_member foreign key(member_id)
references tbl_member(id),
constraint fk_post_reply_post foreign key(reply_post_id)
references tbl_post(id)
);

select * from tbl_post_product;
-- [13] tbl_post_product -- 게시물 (상품)
alter table tbl_post_product
add column product_category_id bigint not null;

create table tbl_post_product (
id         bigint    primary key,                -- pk | 댓글 고유 id (자동 증가)
product_price int   not null,
product_stock int not null,
product_category_id bigint not null,
created_datetime timestamp not null default now(),
updated_datetime timestamp not null default now(),
constraint fk_post_comment_post foreign key(id)
references tbl_post(id)
);

select * from tbl_post_product;

-- [14] tbl_post_hashtag  ─ 해시태그 목록
create table tbl_post_hashtag (
id         bigint       generated always as identity primary key,  -- pk | 해시태그 고유 id (자동 증가)
tag_name   varchar(255) not null unique,                           -- 해시태그 텍스트 - # 기호 제외하고 저장 (unique)
created_datetime timestamp    not null default now()
);


-- [15] tbl_post_hashtag_rel  ─ 게시글 ↔ 해시태그 (n:n)
create table tbl_post_hashtag_rel (
id bigint generated always as identity primary key,
post_id    bigint not null,  -- fk → tbl_post.id
hashtag_id bigint not null,  -- fk → tbl_post_hashtag.id
constraint fk_post_hashtag_rel_post foreign key(post_id)
references tbl_post(id),
constraint fk_post_hashtag_rel_hashtag foreign key(hashtag_id)
references tbl_post_hashtag(id)
);


-- [16] tbl_post_like  ─ 게시글 좋아요 (n:n)
create table tbl_post_like (
id bigint generated always as identity primary key,
member_id  bigint    not null,  -- fk → tbl_member.id | 좋아요 누른 회원
post_id    bigint    not null,  -- fk → tbl_post.id | 좋아요 받은 게시글
created_datetime timestamp not null default now(),                                -- 좋아요 등록 일시
constraint fk_post_like_member foreign key(member_id)
references tbl_member(id),
constraint fk_post_like_post foreign key(post_id)
references tbl_post(id)
);


-- [18] tbl_post_file  ─ 게시글 첨부파일 (1:n)
create table tbl_post_file (
id      bigint generated always as identity  primary key,  -- pk & fk → tbl_file.id
post_id bigint not null,  -- fk → tbl_post.id | 파일이 첨부된 게시글
file_id bigint not null,
constraint fk_post_file_file foreign key(file_id)
references tbl_file(id),
constraint fk_post_file_post foreign key(post_id)
references tbl_post(id)
);


-- [19] tbl_bookmark_folder  ─ 북마크 폴더 (bookmark 화면)
create table tbl_bookmark_folder (
id          bigint       generated always as identity primary key,  -- pk | 폴더 고유 id (자동 증가)
member_id   bigint       not null,           -- fk → tbl_member.id | 폴더 소유 회원
folder_name varchar(255)  not null,           -- 폴더명 (bookmark 화면 maxlength=25)
created_datetime  timestamp    not null default now(),
updated_datetime  timestamp    not null default now(),
constraint fk_bookmark_folder_member foreign key(member_id)
references tbl_member(id)
);



-- [20] tbl_bookmark  ─ 게시글 북마크 (n:n)
create table tbl_bookmark (
id bigint generated always as identity primary key,
member_id  bigint    not null,  -- fk → tbl_member.id | 북마크한 회원
post_id    bigint    not null,  -- fk → tbl_post.id | 북마크된 게시글
folder_id  bigint,              -- fk → tbl_bookmark_folder.id | 소속 폴더 (null이면 미분류)
created_datetime timestamp not null default now(),                                -- 북마크 등록 일시
constraint fk_bookmark_member foreign key(member_id)
references tbl_member(id),
constraint fk_bookmark_post foreign key(post_id)
references tbl_post(id),
constraint fk_bookmark_folder foreign key(folder_id)
references tbl_bookmark_folder(id)
);


-- [28] tbl_estimation  ─ 견적 요청
-- 견적 요청 상태
create type estimation_status as enum (
'approve',    -- 승인됨
'requesting'
'reject'     -- 취소
);
select * from tbl_estimation;
create table tbl_estimation (
id           bigint            generated always as identity primary key,  -- pk | 견적 고유 id (자동 증가)
requester_id bigint            not null,  -- fk → tbl_member.id | 견적 요청자
receiver_id  bigint,  -- fk → tbl_member.id | 특정 수신자 (null이면 공개 견적)
product_id bigint,
title        varchar(255)      not null,                  -- 견적 요청 제목
content      text              not null,                  -- 견적 요청 상세 내용 및 조건
deadline     date,                                        -- 납기 또는 완료 희망일
status       estimation_status not null default 'approve',  -- 견적 진행 상태 (enum)
created_datetime   timestamp         not null default now(),
updated_datetime   timestamp         not null default now(),
constraint fk_estimation_product foreign key(product_id)
references tbl_post(id),
constraint fk_estimation_requester foreign key(requester_id)
references tbl_member(id),
constraint fk_estimation_receiver foreign key(receiver_id)
references tbl_member(id)
);


-- [31] tbl_estimation_tag  ─ 견적 태그 목록
create table tbl_estimation_tag (
id         bigint       generated always as identity primary key,  -- pk | 태그 고유 id (자동 증가)
tag_name   varchar(255) not null unique,                           -- 태그 텍스트 (unique)
created_datetime timestamp    not null default now()
);


-- [32] tbl_estimation_tag_rel  ─ 견적 ↔ 태그 (n:n)
create table tbl_estimation_tag_rel (
estimation_id bigint not null,  -- fk → tbl_estimation.id
tag_id        bigint not null,  -- fk → tbl_estimation_tag.id
primary key (estimation_id, tag_id),
constraint fk_estimation_tag_rel_estimation foreign key(estimation_id)
references tbl_estimation(id),
constraint fk_estimation_tag_rel_tag foreign key(tag_id)
references tbl_estimation_tag(id)
);


-- [34] tbl_conversation  ─ 채팅방
create table tbl_conversation (
id         bigint    generated always as identity primary key,  -- pk | 대화방 고유 id (자동 증가)
title      varchar(255),                                        -- 대화방 제목 - 그룹 채팅용, 1:1 채팅은 null
created_datetime timestamp not null default now(),
updated_datetime timestamp not null default now()  -- 마지막 메시지 발송 시각 (채팅 목록 정렬 기준)
);


-- [35] tbl_conversation_member_rel  ─ 대화방 ↔ 회원 (n:n)
create table tbl_conversation_member_rel (
id bigint generated always as identity primary key,
conversation_id bigint    not null,  -- fk → tbl_conversation.id
sender_id       bigint    not null,  -- fk → tbl_member.id | 대화방 참여 회원
invited_id       bigint    not null,  -- fk → tbl_member.id | 대화방 참여 회원
created_datetime       timestamp not null default now(),                                      -- 대화방 참여(초대) 일시
constraint fk_conversation_member_rel_conversation foreign key(conversation_id)
references tbl_conversation(id),
constraint fk_conversation_member_rel_member foreign key(sender_id)
references tbl_member(id),
constraint fk_conversation_invited_rel_member foreign key(invited_id)
references tbl_member(id)
);


-- [36] tbl_conversation_setting  ─ 대화방별 회원 개인 설정
--     pk = (conversation_id, member_id) 복합키
create table tbl_conversation_setting (
conversation_id      bigint    primary key,  -- pk(복합) & fk → tbl_conversation.id
member_id            bigint    not null,  -- pk(복합) & fk → tbl_member.id
is_screen_blocked    boolean   not null default false,
is_muted             boolean   not null default false,    -- 알림 음소거 여부 (true=음소거)
is_pinned            boolean   not null default false,    -- 채팅 목록 상단 고정 여부 (true=고정)
last_read_message_id bigint,                              -- 마지막으로 읽은 메시지 id - 안읽은 메시지 카운트 계산용
disappear_message    varchar(255)      default 'none',
created_datetime           timestamp not null default now(),
updated_datetime           timestamp not null default now(),
constraint fk_conversation_setting_conversation foreign key(conversation_id)
references tbl_conversation(id),
constraint fk_conversation_setting_member foreign key(member_id)
references tbl_member(id)
);


-- [37] tbl_message  ─ 채팅 메시지
create table tbl_message (
id              bigint    generated always as identity primary key,  -- pk | 메시지 고유 id (자동 증가)
conversation_id bigint    not null,  -- fk → tbl_conversation.id | 소속 대화방
sender_id       bigint    not null,  -- fk → tbl_member.id | 메시지 발신자
content         text      not null,                                                    -- 메시지 본문 (텍스트)
is_deleted      boolean   not null default false,                                      -- 소프트 삭제 여부 (true=삭제됨, "삭제된 메시지" 표시)
created_datetime      timestamp not null default now(),  -- 메시지 발송 일시
constraint fk_message_conversation foreign key(conversation_id)
references tbl_conversation(id),
constraint fk_message_sender foreign key(sender_id)
references tbl_member(id)
);


-- [38] tbl_message_reaction  ─ 메시지 이모지 반응 (n:n)
create table tbl_message_reaction (
message_id bigint      not null,  -- fk → tbl_message.id | 반응 대상 메시지
emoji      varchar(255) not null,                                                 -- 이모지 문자열 (예: 👍 ❤️ 😂)
created_datetime timestamp   not null default now(),
constraint fk_message_reaction_message foreign key(message_id)
references tbl_message(id)
);


-- [39] tbl_chat_file  ─ 채팅 첨부파일 (1:1 → tbl_file)
create table tbl_chat_file (
id         bigint not null primary key,  -- pk & fk → tbl_file.id
message_id bigint not null,  -- fk → tbl_message.id | 파일이 첨부된 메시지
constraint fk_chat_file_file foreign key(id)
references tbl_file(id),
constraint fk_chat_file_message foreign key(message_id)
references tbl_message(id)
);

-- [40] tbl_follow  ─ 팔로우 (회원 ↔ 회원 자기참조 n:n)
-- 팔로우 상태
create table tbl_follow (
id bigint generated always as identity primary key,
follower_id  bigint        not null,  -- fk → tbl_member.id | 팔로우를 하는 회원
following_id bigint        not null,  -- fk → tbl_member.id | 팔로우를 받는 회원
created_datetime   timestamp     not null default now(),                                -- 팔로우 요청/수락 일시
check (follower_id <> following_id),  -- 자기 자신 팔로우 방지
constraint fk_follow_follower foreign key(follower_id)
references tbl_member(id),
constraint fk_follow_following foreign key(following_id)
references tbl_member(id)
);

-- [42] tbl_notification  ─ 알림
-- 알림 유형
create type notification_type as enum (
'connect',      -- 커넥트
'approve',      -- 전문가 접선
'like',         -- 좋아요
'post',         -- 게시글
'reply',        -- 댓글
'message',      -- 채팅 메시지
'estimation',   -- 견적 관련
'system',       -- 시스템 공지
'handle'        -- @핸들
);

create table tbl_notification (
id           bigint            generated always as identity primary key,  -- pk | 알림 고유 id (자동 증가)
recipient_id bigint            not null,                                     -- fk → tbl_member.id | 알림 수신 회원
sender_id    bigint,                                                         -- fk → tbl_member.id | 알림 발신자 (누가 트리거했는지)
notification_type    notification_type not null,                             -- 알림 유형 (enum)
title        varchar(255)      not null,                                     -- 알림 제목 (간략 문구)
content      text              not null,                                     -- 알림 상세 내용
target_id    bigint,                                                         -- 알림 관련 콘텐츠 id (게시글·댓글 등의 pk)
target_type  varchar(255),                                                   -- 관련 콘텐츠 유형 문자열 (예: post, comment, estimation)
is_read      boolean           not null default false,                       -- 읽음 여부 (false=안읽음, true=읽음)
created_datetime   timestamp         not null default now(),
constraint fk_notification_recipient foreign key(recipient_id)
references tbl_member(id),
constraint fk_notification_sender foreign key(sender_id)
references tbl_member(id)
);

-- [43] tbl_subscription  ─ 구독 플랜
-- 구독 플랜 등급 (Subscribe 화면 기준)
create type subscription_tier as enum (
'free',         -- 무료
'pro',          -- 프로
'pro_plus',     -- 프로+
'expert'        -- 전문가
);

-- 구독 활성 상태
create type subscription_status as enum (
'active',       -- 구독 중
'inactive',     -- 해지
'expired'       -- 만료
);

create table tbl_subscription (
id         bigint              generated always as identity primary key,  -- pk | 구독 고유 id (자동 증가)
member_id  bigint              not null,  -- fk → tbl_member.id | 구독 회원
tier          subscription_tier   not null default 'free',    -- 구독 등급 (enum)
billing_cycle varchar(255)        not null default 'monthly', -- 결제 주기 (monthly/annual)
status        subscription_status not null default 'active',  -- 구독 상태 (enum)
started_at timestamp              not null default now(),     -- 구독 시작 일시
expires_at timestamp not null,                                -- 구독 만료 일시
created_datetime timestamp           not null default now(),
updated_datetime timestamp           not null default now(),
quartz boolean default true,
next_tier varchar(255) default null,
next_billing_cycle varchar(255) default null,
constraint fk_subscription_member foreign key(member_id)
references tbl_member(id)
);

alter table tbl_subscription add column next_tier varchar(255) default null;
alter table tbl_subscription add column next_billing_cycle varchar(255) default null;

ALTER TABLE tbl_post ADD COLUMN IF NOT EXISTS product_id bigint;


-- [44] tbl_payment  ─ 결제 내역
-- 결제 처리 상태
create type payment_status as enum (
'pending',      -- 결제 대기
'completed',    -- 결제 완료
'cancelled',    -- 결제 취소
'failed'        -- 결제 실패
);
alter type payment_status add value 'cancelled';
drop table tbl_payment_advertisement;
select * from tbl_payment_advertisement;
-- 결제 내역 광고
create table tbl_payment_advertisement (
id              bigint         generated always as identity primary key,  -- pk | 결제 고유 id (자동 증가)
ad_id bigint         not null,
member_id       bigint         not null,
amount          numeric(15, 2) not null,                                            -- 결제 금액
payment_status  payment_status not null default 'pending',                          -- 결제 처리 상태 (enum)
payment_method  varchar(255),                                                       -- 결제 수단 (라이트 페이)
receipt_id      varchar(255),                                                       -- pg사 발급 결제 영수증 id
paid_at         timestamp,                                                          -- 결제 완료 처리 일시
created_datetime      timestamp      not null default now(),
constraint fk_payment_advertisement foreign key(ad_id)
references tbl_advertisement(id),
constraint fk_payment_advertisement_member foreign key(member_id)
references tbl_member(id)
);

-- 결제 내역 구독
create table tbl_payment_subscribe (
id              bigint         generated always as identity primary key,  -- pk | 결제 고유 id (자동 증가)
subscription_id bigint         not null,  -- fk → tbl_subscription.id | 결제 대상 구독 플랜
member_id       bigint         not null,  -- fk → tbl_member.id | 결제 회원
amount          numeric(15, 2) not null,                                            -- 결제 금액
payment_status  payment_status not null default 'pending',                          -- 결제 처리 상태 (enum)
payment_method  varchar(255),                                                       -- 결제 수단 (라이트 페이)
receipt_id      varchar(255),                                                       -- pg사 발급 결제 영수증 id
paid_at         timestamp,                                                          -- 결제 완료 처리 일시
created_datetime      timestamp      not null default now(),
constraint fk_payment_subscription foreign key(subscription_id)
references tbl_subscription(id),
constraint fk_payment_member foreign key(member_id)
references tbl_member(id)
);

-- [45] tbl_report  ─ 신고
-- 신고 처리 상태
create type report_status as enum (
'pending',      -- 심사중
'applied',      -- 승인됨
'rejected'      -- 기각
);

-- 신고 대상 유형

create type report_target_type as enum (
'post',         -- 게시글
'member'        -- 회원
);

create table tbl_report (
id          bigint             generated always as identity primary key,  -- pk | 신고 고유 id (자동 증가)
reporter_id bigint             not null,  -- fk → tbl_member.id | 신고한 회원
target_id   bigint             not null,                                      -- 신고 대상 id (post_id, comment_id, member_id 등)
target_type report_target_type not null,                                      -- 신고 대상 유형 (enum)
reason      text               not null,                                      -- 신고 사유 상세 내용
status      report_status      not null default 'pending',                    -- 신고 처리 상태 (enum)
created_datetime  timestamp          not null default now(),
updated_datetime  timestamp          not null default now(),
constraint fk_report_reporter foreign key(reporter_id)
references tbl_member(id)
);

-- [46] tbl_badge  ─ 회원 뱃지 (mypage)
-- 뱃지 유형
create type badge_type as enum (
'pro',
'pro_plus',
'expert'
);

create table tbl_badge (
id          bigint     generated always as identity primary key,   -- pk | 뱃지 고유 id (자동 증가)
member_id   bigint     not null,  -- fk → tbl_member.id | 뱃지 획득 회원
badge_type  badge_type not null,                                   -- 뱃지 유형 (enum)
created_datetime  timestamp  not null default now(),  -- 뱃지 획득 일시
updated_datetime  timestamp,
constraint fk_badge_member foreign key(member_id)
references tbl_member(id)
);

-- [47] tbl_news  ─ 뉴스 (admin 등록)
create type news_type as enum(
'general',
'emergency'
);

-- 뉴스 카테고리
create type news_category_type as enum (
'trade',        -- 무역
'market',       -- 시장 동향
'policy',       -- 정책/법률
'technology',   -- 기술
'etc'           -- 기타
);


alter table tbl_news add column post_id bigint not null;
alter table tbl_news ADD constraint fk_news_post
foreign key (post_id) references tbl_post(id);

create table tbl_news (
id            bigint             generated always as identity primary key,  -- pk | 뉴스 고유 id (자동 증가)
admin_id      bigint,  -- fk → tbl_member.id | 뉴스 등록 관리자 (탈퇴 시 null)
news_title         varchar(255)       not null,                -- 뉴스 제목
news_content       text               not null,                -- 뉴스 본문 내용
news_source_url    varchar(255),                               -- 원문 기사 출처 url
news_category news_category_type not null default 'etc', -- 뉴스 카테고리 (enum)
news_type       news_type        not null default 'general', -- 게시 상태 (enum)
published_at  timestamp,                                  -- 실제 게시(발행) 일시 (draft 상태에서는 null)
post_id       bigint,
created_datetime    timestamp          not null default now(),
updated_datetime    timestamp          not null default now(),
constraint fk_news_admin foreign key(admin_id)
references tbl_member(id),
constraint fk_news_post foreign key (post_id)
references tbl_post(id)
);


-- [49] tbl_advertisement  ─ 광고
-- 광고 게재 상태
create type ad_status as enum (
'active',        -- 게재중
'reported',      -- 신고됨
'expired'        -- 만료됨
);

select * from tbl_advertisement;
-- expired_at 컬럼 삭제
-- alter table tbl_advertisement drop expired_at;
create table tbl_advertisement (
    id            bigint         generated always as identity primary key,  -- pk | 광고 고유 id (자동 증가)
    advertiser_id bigint         not null,  -- fk → tbl_member.id | 광고 등록 회원(광고주)
    title         varchar(255)   not null,                   -- 광고 제목 (관리용, adTitle)
    headline      varchar(255)   not null,                   -- 광고 헤드라인 문구 (배너에 표시)
    description   text,                                      -- 광고 상세 설명
    landing_url   varchar(255)   not null,                   -- 광고 클릭 시 이동할 랜딩 페이지 url
    budget              numeric(15, 2) not null default 0,         -- 광고 집행 예산 (원 단위)
    impression_estimate int            not null default 0,         -- 예상 노출 수 (Advertisement 화면 노출 추정)
    receipt_id          varchar(255),                              -- 광고비 결제 영수증 id
    status        ad_status      not null default 'active', -- 광고 게재 상태 (enum)
    started_at    timestamp,                                 -- 광고 게재 시작 일시
    created_datetime    timestamp      not null default now(),
    updated_datetime    timestamp      not null default now(),
    constraint fk_advertisement_advertiser foreign key(advertiser_id)
    references tbl_member(id)
);

select * from tbl_ad_file;
-- [50] tbl_ad_file  ─ 광고 이미지 (1:1 → tbl_file)
create table tbl_ad_file (
id    bigint not null primary key,  -- pk & fk → tbl_file.id
ad_id bigint not null,  -- fk → tbl_advertisement.id | 이미지가 소속된 광고
constraint fk_ad_file_file foreign key(id)
references tbl_file(id),
constraint fk_ad_file_ad foreign key(ad_id)
references tbl_advertisement(id)
);

-- [51] tbl_video_session  ─ 화상 채팅 세션 (video-chat 화면, Pro+ 구독 기능)
create table tbl_video_session (
id              bigint    generated always as identity primary key,  -- pk | 세션 고유 id (자동 증가)
conversation_id bigint    not null,           -- fk → tbl_conversation.id | 연결된 대화방
caller_id       bigint    not null,           -- fk → tbl_member.id | 발신자
receiver_id     bigint    not null,           -- fk → tbl_member.id | 수신자
started_at      timestamp not null default now(),  -- 통화 시작 일시
ended_at        timestamp,                         -- 통화 종료 일시 (null이면 진행 중)
duration_sec    int       default 0,               -- 통화 시간 (단위: 초)
created_datetime      timestamp not null default now(),
constraint fk_video_session_conversation foreign key(conversation_id)
references tbl_conversation(id),
constraint fk_video_session_caller foreign key(caller_id)
references tbl_member(id),
constraint fk_video_session_receiver foreign key(receiver_id)
references tbl_member(id)
);

-- 화상채팅 녹음파일 정보
create table tbl_video_recoding (
id bigint not null primary key,
video_session_id    bigint not null,                    -- tbl_video_session FK
constraint fk_file_recoding foreign key (id)
references tbl_file (id),
constraint fk_recoding_session foreign key (video_session_id)
references tbl_video_session (id)
);


-- [55] tbl_community  ─ 커뮤니티 (estimation-regist 화면: 무역 토크, 상품 연구소)

create table tbl_community (
id             bigint       generated always as identity primary key,
community_name varchar(255) not null,           -- 커뮤니티 이름
description    text,                            -- 커뮤니티 설명
created_datetime     timestamp    not null default now(),
updated_datetime     timestamp    not null default now()
);


-- [56] tbl_community_member_rel  ─ 커뮤니티 ↔ 회원 (n:n)

create table tbl_community_member (
community_id bigint    not null,  -- fk → tbl_community.id
member_id    bigint    not null,  -- fk → tbl_member.id
joined_at    timestamp not null default now(),
primary key (community_id, member_id),
constraint fk_community_member_community foreign key(community_id)
references tbl_community(id),
constraint fk_community_member_member foreign key(member_id)
references tbl_member(id)
);

-- [61] tbl_trending  ─ 트렌딩 토픽 (explore 화면)

create table tbl_trending (
id          bigint       generated always as identity primary key,
hashtag_id  bigint,              -- fk → tbl_post_hashtag.id (null이면 키워드 기반)
keyword     varchar(255),        -- 해시태그가 아닌 트렌딩 키워드
region      varchar(255),        -- 지역 (예: South Korea, Global)
created_datetime  timestamp    not null default now(),
updated_datetime  timestamp,
constraint fk_trending_hashtag foreign key(hashtag_id)
references tbl_post_hashtag(id)
);


-- [62] tbl_notification_preference  ─ 알림 설정 (setting 화면)
drop table tbl_notification_preference;
create table tbl_notification_preference (
     id bigint generated always as identity primary key,
     member_id bigint not null unique,
     push_connect boolean not null default true,
     push_expert boolean not null default true,
     push_likes boolean not null default true,
     push_posts boolean not null default true,
     push_comments boolean not null default true,
     push_chat_messages boolean not null default true,
     push_quotes boolean not null default true,
     push_system boolean not null default true,
     push_mentions boolean not null default true,
     created_datetime timestamp not null default now(),
     updated_datetime timestamp not null default now(),
     constraint fk_notification_preference_member
     foreign key(member_id) references tbl_member(id)
);

-- [63] tbl_block  ─ 사용자 차단 (setting 화면)

create table tbl_block (
id bigint generated always as identity primary key,
blocker_id bigint    not null,  -- fk → tbl_member.id | 차단한 회원
blocked_id bigint    not null,  -- fk → tbl_member.id | 차단된 회원
created_datetime timestamp not null default now(),
check (blocker_id <> blocked_id),
constraint fk_block_blocker foreign key(blocker_id)
references tbl_member(id),
constraint fk_block_blocked foreign key(blocked_id)
references tbl_member(id)
);


-- [64] tbl_mute  ─ 사용자 뮤트 (setting 화면)

create table tbl_mute (
id bigint generated  always  as identity primary key,
muter_id   bigint    not null,  -- fk → tbl_member.id | 뮤트한 회원
muted_id   bigint    not null,  -- fk → tbl_member.id | 뮤트된 회원
created_datetime timestamp not null default now(),
check (muter_id <> muted_id),
constraint fk_mute_muter foreign key(muter_id)
references tbl_member(id),
constraint fk_mute_muted foreign key(muted_id)
references tbl_member(id)
);


-- [65] tbl_muted_word  ─ 단어 뮤트 (setting 화면)

create table tbl_muted_word (
id         bigint       generated always as identity primary key,
member_id  bigint       not null,           -- fk → tbl_member.id
word       varchar(255) not null,           -- 뮤트할 단어/문구
scope      varchar(255) not null default 'timeline', -- 적용 범위 (timeline / notifications / both)
audience   varchar(255) not null default 'everyone',  -- 대상 (everyone / non_following)
duration   varchar(255) not null default 'forever',   -- 기간 (forever / 24h / 7d / 30d)
expires_at timestamp,                       -- 만료 일시 (forever이면 null)
created_datetime timestamp    not null default now(),
constraint fk_muted_word_member foreign key(member_id)
references tbl_member(id)
);


-- [66] tbl_search_history  ─ 검색 기록 (explore 화면)

create table tbl_mention(
id bigint generated always as identity primary key,
mention_tagger_id bigint not null,
mention_tagged_id bigint not null,
post_id bigint not null,
constraint fk_mention_tagger foreign key(mention_tagger_id)
references tbl_member(id),
constraint fk_mention_tagged foreign key(mention_tagged_id)
references tbl_member(id),
constraint fk_mention_post foreign key(post_id)
references tbl_post(id)
);

create table tbl_search_history (
id         bigint       generated always as identity primary key,
member_id  bigint       not null,           -- fk → tbl_member.id
search_keyword      varchar(255) not null,           -- 검색어
search_count int default  0,
created_datetime timestamp    not null default now(),
constraint fk_search_history_member foreign key(member_id)
references tbl_member(id)
);


-- -- ============================================================
-- -- 인덱스 (성능 최적화)
-- -- ============================================================
--
-- -- 게시글 피드/프로필 조회
-- create index idx_post_member_id on tbl_post(member_id);
-- create index idx_post_created_at on tbl_post(created_datetime desc);
-- create index idx_post_board_type_status on tbl_post(board_type, post_status) where post_status = 'active';
-- create index idx_post_product_cat on tbl_post(product_cat) where product_cat is not null;
--
-- -- 댓글 조회
-- create index idx_post_comment_post_id on tbl_post_comment(post_id);
-- create index idx_post_comment_parent_id on tbl_post_comment(parent_id);
--
-- -- 좋아요 역방향 조회
-- create index idx_post_like_post_id on tbl_post_like(post_id);
-- create index idx_comment_like_comment_id on tbl_comment_like(comment_id);
--
-- -- 팔로우 그래프
-- create index idx_follow_following_id on tbl_follow(following_id);
--
-- -- 채팅 메시지 조회
-- create index idx_message_conversation_id on tbl_message(conversation_id, created_datetime desc);
--
-- -- 알림 인박스
-- create index idx_notification_recipient on tbl_notification(recipient_id, is_read, created_datetime desc);
--
-- -- 북마크 폴더별 조회
-- create index idx_bookmark_folder_id on tbl_bookmark(folder_id);
--
-- -- 견적 조회
-- create index idx_estimation_requester on tbl_estimation(requester_id);
-- create index idx_estimation_status on tbl_estimation(status) where status = 'open';
--
-- -- 뉴스 목록
-- create index idx_news_status_published on tbl_news(status, published_at desc) where status = 'published';
--
-- -- 신고 관리자 큐
-- create index idx_report_status on tbl_report(status) where status = 'pending';
--
-- -- 리포스트 조회
-- create index idx_repost_post_id on tbl_repost(post_id);
--
-- -- 차단/뮤트 조회
-- create index idx_block_blocked_id on tbl_block(blocked_id);
-- create index idx_mute_muted_id on tbl_mute(muted_id);
--
-- -- 검색 기록
-- create index idx_search_history_member on tbl_search_history(member_id, created_datetime desc);
--
-- -- 트렌딩
-- create index idx_trending_period_rank on tbl_trending(period, rank_num);
--
-- -- 전문가 통계 이력
-- create index idx_expert_stats_history on tbl_expert_stats_history(expert_id, recorded_date desc);
--
-- -- 구독 조회
-- create index idx_subscription_member on tbl_subscription(member_id);
--
-- -- 결제 조회
-- create index idx_payment_member on tbl_payment(member_id);
--
-- -- 광고 상태별 조회
-- create index idx_advertisement_status on tbl_advertisement(status);


-- end of schema
-- 총 enum 타입: 26개
-- 총 테이블:    66개
-- 총 인덱스:    25개
-- created_at → created_datetime, updated_at → updated_datetime 전체 적용
-- ALTER TABLE 없음 (모든 컬럼 테이블 정의에 직접 반영)