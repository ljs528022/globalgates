-- ==========================================================
-- GlobalGates Full DDL - 전체 DB 한번에 생성용
-- PostgreSQL
-- 생성일: 2026-04-02
-- ==========================================================
-- 주의: 빈 DB에서 실행해야 합니다.
-- 기존 DB가 있다면 먼저 DROP DATABASE 후 CREATE DATABASE 하세요.
-- ==========================================================

-- ============================================================
-- 1. ENUM 타입 전부
-- ============================================================

CREATE TYPE file_content_type    AS ENUM ('image', 'video', 'document', 'etc', 'audio');
CREATE TYPE member_status        AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE member_role          AS ENUM ('business', 'expert', 'admin');
CREATE TYPE oauth_provider       AS ENUM ('kakao', 'facebook', 'naver');
CREATE TYPE profile_type         AS ENUM ('profile', 'banner');
CREATE TYPE post_status          AS ENUM ('active', 'inactive');
CREATE TYPE estimation_status    AS ENUM ('approve', 'requesting', 'reject');
CREATE TYPE notification_type    AS ENUM ('connect', 'approve', 'like', 'post', 'reply', 'message', 'estimation', 'system', 'handle');
CREATE TYPE subscription_tier    AS ENUM ('free', 'pro', 'pro_plus', 'expert');
CREATE TYPE subscription_status  AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE payment_status       AS ENUM ('pending', 'completed', 'cancelled', 'failed');
CREATE TYPE report_status        AS ENUM ('pending', 'applied', 'rejected');
CREATE TYPE report_target_type   AS ENUM ('post', 'member');
CREATE TYPE badge_type           AS ENUM ('pro', 'pro_plus', 'expert');
CREATE TYPE news_type            AS ENUM ('general', 'emergency');
CREATE TYPE news_category_type   AS ENUM ('trade', 'market', 'policy', 'technology', 'etc');
CREATE TYPE ad_status            AS ENUM ('active', 'reported', 'expired');
CREATE TYPE community_status     AS ENUM ('active', 'inactive');
CREATE TYPE community_member_role AS ENUM ('admin', 'moderator', 'member');

-- ============================================================
-- 2. 독립 테이블 (FK 없음)
-- ============================================================

-- tbl_file
CREATE TABLE tbl_file (
    id               bigint             GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_name    varchar(255)       NOT NULL,
    file_name        varchar(255)       NOT NULL,
    file_path        varchar(255)       NOT NULL,
    file_size        bigint             NOT NULL DEFAULT 0,
    content_type     file_content_type  NOT NULL DEFAULT 'image',
    created_datetime timestamp          NOT NULL DEFAULT now()
);

-- tbl_member
CREATE TABLE tbl_member (
    id                    bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_name           varchar(255),
    member_email          varchar(255)  NOT NULL UNIQUE,
    member_password       varchar(255),
    member_nickname       varchar(255),
    member_handle         varchar(255)  UNIQUE NOT NULL,
    member_phone          varchar(255),
    member_bio            text,
    member_region         varchar(255),
    member_status         member_status NOT NULL DEFAULT 'active',
    member_role           member_role   NOT NULL DEFAULT 'business',
    push_enabled          boolean       NOT NULL DEFAULT true,
    website_url           varchar(255),
    birth_date            varchar(255),
    created_datetime      timestamp     NOT NULL DEFAULT now(),
    updated_datetime      timestamp     NOT NULL DEFAULT now(),
    last_login_at         timestamp,
    member_language       varchar(255),
    member_country        varchar(255),
    member_login_verified boolean       DEFAULT true
);

-- tbl_category
CREATE TABLE tbl_category (
    id                         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_category_parent_id bigint,
    category_name              varchar(255) NOT NULL UNIQUE,
    created_datetime           timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_product_category_parent_id_category
        FOREIGN KEY (product_category_parent_id) REFERENCES tbl_category(id)
);

-- tbl_conversation
CREATE TABLE tbl_conversation (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title            varchar(255),
    created_datetime timestamp NOT NULL DEFAULT now(),
    updated_datetime timestamp NOT NULL DEFAULT now()
);

-- tbl_post_hashtag
CREATE TABLE tbl_post_hashtag (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_name         varchar(255) NOT NULL UNIQUE,
    created_datetime timestamp    NOT NULL DEFAULT now()
);

-- tbl_estimation_tag
CREATE TABLE tbl_estimation_tag (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_name         varchar(255) NOT NULL UNIQUE,
    created_datetime timestamp    NOT NULL DEFAULT now()
);

-- tbl_community
CREATE TABLE tbl_community (
    id               bigint           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    community_name   varchar(255)     NOT NULL,
    description      text,
    creator_id       bigint           NOT NULL,
    community_status community_status NOT NULL DEFAULT 'active',
    category_id      bigint,
    created_datetime timestamp        NOT NULL DEFAULT now(),
    updated_datetime timestamp        NOT NULL DEFAULT now(),
    CONSTRAINT fk_community_creator
        FOREIGN KEY (creator_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_community_category
        FOREIGN KEY (category_id) REFERENCES tbl_category(id)
);

-- ============================================================
-- 3. tbl_member 의존 테이블
-- ============================================================

-- tbl_address
CREATE TABLE tbl_address (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    postal_code      varchar(255) NOT NULL,
    country          varchar(255) NOT NULL,
    country_code     varchar(255) NOT NULL,
    address1         varchar(255) NOT NULL,
    address2         varchar(255),
    city             varchar(255),
    created_datetime timestamp    NOT NULL DEFAULT now(),
    updated_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_address_member FOREIGN KEY (id) REFERENCES tbl_member(id)
);

-- tbl_business_member
CREATE TABLE tbl_business_member (
    id               bigint       PRIMARY KEY,
    business_number  varchar(255) NOT NULL UNIQUE,
    company_name     varchar(255) NOT NULL,
    ceo_name         varchar(255) NOT NULL,
    business_type    varchar(255),
    created_datetime timestamp    NOT NULL DEFAULT now(),
    updated_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_business_member_member FOREIGN KEY (id) REFERENCES tbl_member(id)
);

-- tbl_oauth
CREATE TABLE tbl_oauth (
    id               bigint         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id      varchar(255)   UNIQUE NOT NULL,
    provider         oauth_provider NOT NULL,
    profile_url      varchar(255),
    member_id        bigint         NOT NULL,
    created_datetime timestamp      NOT NULL DEFAULT now(),
    updated_datetime timestamp      DEFAULT now(),
    CONSTRAINT fk_oauth_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_member_profile_file
CREATE TABLE tbl_member_profile_file (
    id                 bigint       NOT NULL PRIMARY KEY,
    member_id          bigint       NOT NULL,
    profile_image_type profile_type DEFAULT 'profile',
    CONSTRAINT fk_file_member_profile_file FOREIGN KEY (id) REFERENCES tbl_file(id),
    CONSTRAINT fk_file_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_member_category_rel (회원 <-> 카테고리 n:n)
CREATE TABLE tbl_member_category_rel (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id   bigint NOT NULL,
    category_id bigint NOT NULL,
    CONSTRAINT fk_member_category_rel_member
        FOREIGN KEY (member_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_member_category_rel_category
        FOREIGN KEY (category_id) REFERENCES tbl_category(id)
);

-- ============================================================
-- 4. tbl_post 및 의존 테이블
-- ============================================================

-- tbl_post
CREATE TABLE tbl_post (
    id               bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint      NOT NULL,
    post_status      post_status NOT NULL DEFAULT 'active',
    title            varchar(255),
    content          text        NOT NULL,
    location         varchar(255),
    reply_post_id    bigint,
    community_id     bigint,
    created_datetime timestamp   NOT NULL DEFAULT now(),
    updated_datetime timestamp   NOT NULL DEFAULT now(),
    CONSTRAINT fk_post_member FOREIGN KEY (member_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_post_reply_post FOREIGN KEY (reply_post_id) REFERENCES tbl_post(id),
    CONSTRAINT fk_post_community FOREIGN KEY (community_id) REFERENCES tbl_community(id)
);

-- tbl_post_product
CREATE TABLE tbl_post_product (
    id                  bigint    PRIMARY KEY,
    product_category_id bigint,
    product_price       int       NOT NULL,
    product_stock       int       NOT NULL,
    created_datetime    timestamp NOT NULL DEFAULT now(),
    updated_datetime    timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_post_product_post FOREIGN KEY (id) REFERENCES tbl_post(id),
    CONSTRAINT fk_post_product_category FOREIGN KEY (product_category_id) REFERENCES tbl_category(id)
);

-- tbl_post_hashtag_rel
CREATE TABLE tbl_post_hashtag_rel (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    bigint NOT NULL,
    hashtag_id bigint NOT NULL,
    CONSTRAINT fk_post_hashtag_rel_post FOREIGN KEY (post_id) REFERENCES tbl_post(id),
    CONSTRAINT fk_post_hashtag_rel_hashtag FOREIGN KEY (hashtag_id) REFERENCES tbl_post_hashtag(id)
);

-- tbl_post_like
CREATE TABLE tbl_post_like (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint    NOT NULL,
    post_id          bigint    NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_post_like_member FOREIGN KEY (member_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES tbl_post(id)
);

-- tbl_post_file
CREATE TABLE tbl_post_file (
    id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id bigint NOT NULL,
    file_id bigint NOT NULL,
    CONSTRAINT fk_post_file_file FOREIGN KEY (file_id) REFERENCES tbl_file(id),
    CONSTRAINT fk_post_file_post FOREIGN KEY (post_id) REFERENCES tbl_post(id)
);

-- tbl_post_temp (임시 게시글)
CREATE TABLE tbl_post_temp (
    id                 bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id          bigint    NOT NULL,
    post_temp_content  text      NOT NULL,
    post_temp_location text,
    post_temp_tags     text,
    created_datetime   timestamp NOT NULL DEFAULT now(),
    updated_datetime   timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_post_temp_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_mention
CREATE TABLE tbl_mention (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mention_tagger_id bigint NOT NULL,
    mention_tagged_id bigint NOT NULL,
    post_id           bigint NOT NULL,
    CONSTRAINT fk_mention_tagger FOREIGN KEY (mention_tagger_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_mention_tagged FOREIGN KEY (mention_tagged_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_mention_post FOREIGN KEY (post_id) REFERENCES tbl_post(id)
);

-- ============================================================
-- 5. 북마크
-- ============================================================

-- tbl_bookmark_folder
CREATE TABLE tbl_bookmark_folder (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint       NOT NULL,
    folder_name      varchar(255) NOT NULL,
    created_datetime timestamp    NOT NULL DEFAULT now(),
    updated_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_bookmark_folder_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_bookmark
CREATE TABLE tbl_bookmark (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint    NOT NULL,
    post_id          bigint    NOT NULL,
    folder_id        bigint,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_bookmark_member FOREIGN KEY (member_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_bookmark_post FOREIGN KEY (post_id) REFERENCES tbl_post(id),
    CONSTRAINT fk_bookmark_folder FOREIGN KEY (folder_id) REFERENCES tbl_bookmark_folder(id),
    CONSTRAINT uq_bookmark_member_post_folder UNIQUE (member_id, post_id, folder_id)
);

-- ============================================================
-- 6. 견적
-- ============================================================

-- tbl_estimation
CREATE TABLE tbl_estimation (
    id               bigint            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requester_id     bigint            NOT NULL,
    receiver_id      bigint,
    product_id       bigint,
    title            varchar(255)      NOT NULL,
    content          text              NOT NULL,
    deadline         date,
    location         varchar(255),
    status           estimation_status NOT NULL DEFAULT 'approve',
    created_datetime timestamp         NOT NULL DEFAULT now(),
    updated_datetime timestamp         NOT NULL DEFAULT now(),
    CONSTRAINT fk_estimation_product FOREIGN KEY (product_id) REFERENCES tbl_post(id),
    CONSTRAINT fk_estimation_requester FOREIGN KEY (requester_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_estimation_receiver FOREIGN KEY (receiver_id) REFERENCES tbl_member(id)
);

-- tbl_estimation_tag_rel
CREATE TABLE tbl_estimation_tag_rel (
    estimation_id bigint NOT NULL,
    tag_id        bigint NOT NULL,
    PRIMARY KEY (estimation_id, tag_id),
    CONSTRAINT fk_estimation_tag_rel_estimation FOREIGN KEY (estimation_id) REFERENCES tbl_estimation(id),
    CONSTRAINT fk_estimation_tag_rel_tag FOREIGN KEY (tag_id) REFERENCES tbl_estimation_tag(id)
);

-- ============================================================
-- 7. 채팅 (chat_migration.sql 최신 버전)
-- ============================================================

-- tbl_conversation_member_rel
CREATE TABLE tbl_conversation_member_rel (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id  bigint    NOT NULL,
    sender_id        bigint    NOT NULL,
    invited_id       bigint    NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_conversation_member_rel_conversation
        FOREIGN KEY (conversation_id) REFERENCES tbl_conversation(id),
    CONSTRAINT fk_conversation_member_rel_member
        FOREIGN KEY (sender_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_conversation_invited_rel_member
        FOREIGN KEY (invited_id) REFERENCES tbl_member(id)
);

-- tbl_conversation_setting (복합 PK: conversation_id + member_id)
CREATE TABLE tbl_conversation_setting (
    conversation_id           bigint       NOT NULL,
    member_id                 bigint       NOT NULL,
    alias                     varchar(255),
    is_screen_blocked         boolean      NOT NULL DEFAULT false,
    is_muted                  boolean      NOT NULL DEFAULT false,
    is_deleted                boolean      DEFAULT false,
    deleted_after_message_id  bigint       DEFAULT NULL,
    is_pinned                 boolean      NOT NULL DEFAULT false,
    last_read_message_id      bigint,
    disappear_message         varchar(255) DEFAULT 'none',
    disappear_activated_at    timestamp    DEFAULT NULL,
    blocked_after_message_id  bigint       DEFAULT NULL,
    block_released_message_id bigint       DEFAULT NULL,
    created_datetime          timestamp    NOT NULL DEFAULT now(),
    updated_datetime          timestamp    NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, member_id),
    CONSTRAINT fk_conversation_setting_conversation
        FOREIGN KEY (conversation_id) REFERENCES tbl_conversation(id),
    CONSTRAINT fk_conversation_setting_member
        FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_message
CREATE TABLE tbl_message (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id  bigint    NOT NULL,
    sender_id        bigint    NOT NULL,
    content          text      NOT NULL,
    reply_message_id bigint,
    is_deleted       boolean   NOT NULL DEFAULT false,
    created_datetime timestamp NOT NULL DEFAULT now(),
    updated_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_message_conversation
        FOREIGN KEY (conversation_id) REFERENCES tbl_conversation(id),
    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id) REFERENCES tbl_member(id)
);

-- tbl_message_reaction
CREATE TABLE tbl_message_reaction (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id       bigint       NOT NULL,
    member_id        bigint       NOT NULL,
    emoji            varchar(255) NOT NULL,
    created_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_message_reaction_message
        FOREIGN KEY (message_id) REFERENCES tbl_message(id),
    CONSTRAINT fk_message_reaction_member
        FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_message_deletion (per-member soft delete)
CREATE TABLE tbl_message_deletion (
    message_id       bigint    NOT NULL,
    member_id        bigint    NOT NULL,
    deleted_datetime timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (message_id, member_id),
    CONSTRAINT fk_msg_del_message FOREIGN KEY (message_id) REFERENCES tbl_message(id),
    CONSTRAINT fk_msg_del_member  FOREIGN KEY (member_id)  REFERENCES tbl_member(id)
);

-- tbl_chat_file
CREATE TABLE tbl_chat_file (
    id         bigint NOT NULL PRIMARY KEY,
    message_id bigint NOT NULL,
    CONSTRAINT fk_chat_file_file FOREIGN KEY (id) REFERENCES tbl_file(id),
    CONSTRAINT fk_chat_file_message FOREIGN KEY (message_id) REFERENCES tbl_message(id)
);

-- ============================================================
-- 8. 팔로우 / 알림 / 구독
-- ============================================================

-- tbl_follow
CREATE TABLE tbl_follow (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    follower_id      bigint    NOT NULL,
    following_id     bigint    NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CHECK (follower_id <> following_id),
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES tbl_member(id)
);

-- tbl_notification
CREATE TABLE tbl_notification (
    id                bigint            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_id      bigint            NOT NULL,
    sender_id         bigint,
    notification_type notification_type NOT NULL,
    title             varchar(255)      NOT NULL,
    content           text              NOT NULL,
    target_id         bigint,
    target_type       varchar(255),
    is_read           boolean           NOT NULL DEFAULT false,
    created_datetime  timestamp         NOT NULL DEFAULT now(),
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES tbl_member(id)
);

-- tbl_notification_preference (notification_preference.sql 최신 버전)
CREATE TABLE tbl_notification_preference (
    id                          bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id                   bigint    NOT NULL UNIQUE,
    quality_filter_enabled      boolean   NOT NULL DEFAULT true,
    muted_non_following         boolean   NOT NULL DEFAULT false,
    muted_not_following_you     boolean   NOT NULL DEFAULT false,
    muted_new_account           boolean   NOT NULL DEFAULT false,
    muted_default_profile       boolean   NOT NULL DEFAULT false,
    muted_unverified_email      boolean   NOT NULL DEFAULT false,
    muted_unverified_phone      boolean   NOT NULL DEFAULT false,
    push_connect                boolean   NOT NULL DEFAULT true,
    push_expert                 boolean   NOT NULL DEFAULT true,
    push_likes                  boolean   NOT NULL DEFAULT true,
    push_posts                  boolean   NOT NULL DEFAULT true,
    push_comments               boolean   NOT NULL DEFAULT true,
    push_chat_messages          boolean   NOT NULL DEFAULT true,
    push_quotes                 boolean   NOT NULL DEFAULT true,
    push_system                 boolean   NOT NULL DEFAULT true,
    push_mentions               boolean   NOT NULL DEFAULT true,
    created_datetime            timestamp NOT NULL DEFAULT now(),
    updated_datetime            timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_notification_preference_member
        FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_subscription
CREATE TABLE tbl_subscription (
    id               bigint              GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint              NOT NULL,
    tier             subscription_tier   NOT NULL DEFAULT 'free',
    billing_cycle    varchar(255)        NOT NULL DEFAULT 'monthly',
    status           subscription_status NOT NULL DEFAULT 'active',
    started_at       timestamp           NOT NULL DEFAULT now(),
    expires_at       timestamp           NOT NULL,
    quartz           boolean             DEFAULT true,
    created_datetime timestamp           NOT NULL DEFAULT now(),
    updated_datetime timestamp           NOT NULL DEFAULT now(),
    CONSTRAINT fk_subscription_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- ============================================================
-- 9. 광고
-- ============================================================

-- tbl_advertisement
CREATE TABLE tbl_advertisement (
    id                  bigint         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    advertiser_id       bigint         NOT NULL,
    title               varchar(255)   NOT NULL,
    headline            varchar(255)   NOT NULL,
    description         text,
    landing_url         varchar(255)   NOT NULL,
    budget              numeric(15, 2) NOT NULL DEFAULT 0,
    impression_estimate int            NOT NULL DEFAULT 0,
    receipt_id          varchar(255),
    status              ad_status      NOT NULL DEFAULT 'active',
    started_at          timestamp,
    created_datetime    timestamp      NOT NULL DEFAULT now(),
    updated_datetime    timestamp      NOT NULL DEFAULT now(),
    CONSTRAINT fk_advertisement_advertiser FOREIGN KEY (advertiser_id) REFERENCES tbl_member(id)
);

-- tbl_ad_file
CREATE TABLE tbl_ad_file (
    id    bigint NOT NULL PRIMARY KEY,
    ad_id bigint NOT NULL,
    CONSTRAINT fk_ad_file_file FOREIGN KEY (id) REFERENCES tbl_file(id),
    CONSTRAINT fk_ad_file_ad FOREIGN KEY (ad_id) REFERENCES tbl_advertisement(id)
);

-- ============================================================
-- 10. 결제
-- ============================================================

-- tbl_payment_advertisement
CREATE TABLE tbl_payment_advertisement (
    id               bigint         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ad_id            bigint         NOT NULL,
    member_id        bigint         NOT NULL,
    amount           numeric(15, 2) NOT NULL,
    payment_status   payment_status NOT NULL DEFAULT 'pending',
    payment_method   varchar(255),
    receipt_id       varchar(255),
    paid_at          timestamp,
    created_datetime timestamp      NOT NULL DEFAULT now(),
    CONSTRAINT fk_payment_advertisement FOREIGN KEY (ad_id) REFERENCES tbl_advertisement(id),
    CONSTRAINT fk_payment_advertisement_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_payment_subscribe
CREATE TABLE tbl_payment_subscribe (
    id               bigint         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscription_id  bigint         NOT NULL,
    member_id        bigint         NOT NULL,
    amount           numeric(15, 2) NOT NULL,
    payment_status   payment_status NOT NULL DEFAULT 'pending',
    payment_method   varchar(255),
    receipt_id       varchar(255),
    paid_at          timestamp,
    created_datetime timestamp      NOT NULL DEFAULT now(),
    CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES tbl_subscription(id),
    CONSTRAINT fk_payment_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- ============================================================
-- 11. 신고 / 뱃지 / 뉴스
-- ============================================================

-- tbl_report
CREATE TABLE tbl_report (
    id               bigint             GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporter_id      bigint             NOT NULL,
    target_id        bigint             NOT NULL,
    target_type      report_target_type NOT NULL,
    reason           text               NOT NULL,
    status           report_status      NOT NULL DEFAULT 'pending',
    created_datetime timestamp          NOT NULL DEFAULT now(),
    updated_datetime timestamp          NOT NULL DEFAULT now(),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES tbl_member(id)
);

-- tbl_badge
CREATE TABLE tbl_badge (
    id               bigint     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint     NOT NULL,
    badge_type       badge_type NOT NULL,
    created_datetime timestamp  NOT NULL DEFAULT now(),
    updated_datetime timestamp,
    CONSTRAINT fk_badge_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_news
CREATE TABLE tbl_news (
    id               bigint             GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id         bigint,
    news_title       varchar(255)       NOT NULL,
    news_content     text               NOT NULL,
    news_source_url  varchar(255),
    news_category    news_category_type NOT NULL DEFAULT 'etc',
    news_type        news_type          NOT NULL DEFAULT 'general',
    published_at     timestamp,
    created_datetime timestamp          NOT NULL DEFAULT now(),
    updated_datetime timestamp          NOT NULL DEFAULT now(),
    CONSTRAINT fk_news_admin FOREIGN KEY (admin_id) REFERENCES tbl_member(id)
);

-- ============================================================
-- 12. 화상 / 커뮤니티 멤버 / 트렌딩 / 차단 / 뮤트 / 검색
-- ============================================================

-- tbl_video_session
CREATE TABLE tbl_video_session (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id  bigint    NOT NULL,
    caller_id        bigint    NOT NULL,
    receiver_id      bigint    NOT NULL,
    started_at       timestamp NOT NULL DEFAULT now(),
    ended_at         timestamp,
    duration_sec     int       DEFAULT 0,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_video_session_conversation FOREIGN KEY (conversation_id) REFERENCES tbl_conversation(id),
    CONSTRAINT fk_video_session_caller FOREIGN KEY (caller_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_video_session_receiver FOREIGN KEY (receiver_id) REFERENCES tbl_member(id)
);

CREATE INDEX idx_video_session_caller_id ON tbl_video_session(caller_id);
CREATE INDEX idx_video_session_receiver_id ON tbl_video_session(receiver_id);

-- tbl_ai_video_summary (화상 채팅 AI 요약본)
CREATE TABLE tbl_ai_video_summary (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    video_session_id bigint    NOT NULL UNIQUE,
    summary          text      NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_ai_video_summary_session FOREIGN KEY (video_session_id) REFERENCES tbl_video_session(id)
);

-- tbl_video_recoding (녹음 파일)
CREATE TABLE tbl_video_recoding (
    id               bigint NOT NULL PRIMARY KEY,
    video_session_id bigint NOT NULL,
    CONSTRAINT fk_file_recoding FOREIGN KEY (id) REFERENCES tbl_file(id),
    CONSTRAINT fk_recoding_session FOREIGN KEY (video_session_id) REFERENCES tbl_video_session(id)
);

-- tbl_community_member
CREATE TABLE tbl_community_member (
    community_id bigint               NOT NULL,
    member_id    bigint               NOT NULL,
    member_role  community_member_role NOT NULL DEFAULT 'member',
    joined_at    timestamp            NOT NULL DEFAULT now(),
    PRIMARY KEY (community_id, member_id),
    CONSTRAINT fk_community_member_community FOREIGN KEY (community_id) REFERENCES tbl_community(id),
    CONSTRAINT fk_community_member_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_community_file (커버 이미지)
CREATE TABLE tbl_community_file (
    id           bigint PRIMARY KEY,
    community_id bigint NOT NULL,
    CONSTRAINT fk_community_file_file FOREIGN KEY (id) REFERENCES tbl_file(id),
    CONSTRAINT fk_community_file_community FOREIGN KEY (community_id) REFERENCES tbl_community(id)
);

-- tbl_trending
CREATE TABLE tbl_trending (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hashtag_id       bigint,
    keyword          varchar(255),
    region           varchar(255),
    created_datetime timestamp    NOT NULL DEFAULT now(),
    updated_datetime timestamp,
    CONSTRAINT fk_trending_hashtag FOREIGN KEY (hashtag_id) REFERENCES tbl_post_hashtag(id)
);

-- tbl_block
CREATE TABLE tbl_block (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blocker_id       bigint    NOT NULL,
    blocked_id       bigint    NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CHECK (blocker_id <> blocked_id),
    UNIQUE (blocker_id, blocked_id),
    CONSTRAINT fk_block_blocker FOREIGN KEY (blocker_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES tbl_member(id)
);

-- tbl_mute
CREATE TABLE tbl_mute (
    id               bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    muter_id         bigint    NOT NULL,
    muted_id         bigint    NOT NULL,
    created_datetime timestamp NOT NULL DEFAULT now(),
    CHECK (muter_id <> muted_id),
    CONSTRAINT fk_mute_muter FOREIGN KEY (muter_id) REFERENCES tbl_member(id),
    CONSTRAINT fk_mute_muted FOREIGN KEY (muted_id) REFERENCES tbl_member(id)
);

-- tbl_muted_word
CREATE TABLE tbl_muted_word (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint       NOT NULL,
    word             varchar(255) NOT NULL,
    scope            varchar(255) NOT NULL DEFAULT 'timeline',
    audience         varchar(255) NOT NULL DEFAULT 'everyone',
    duration         varchar(255) NOT NULL DEFAULT 'forever',
    expires_at       timestamp,
    created_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_muted_word_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- tbl_search_history
CREATE TABLE tbl_search_history (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id        bigint       NOT NULL,
    search_keyword   varchar(255) NOT NULL,
    search_count     int          DEFAULT 0,
    created_datetime timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT fk_search_history_member FOREIGN KEY (member_id) REFERENCES tbl_member(id)
);

-- ============================================================
-- 13. 인덱스
-- ============================================================

CREATE INDEX idx_community_member_member_id ON tbl_community_member (member_id);
CREATE INDEX idx_post_community_id ON tbl_post (community_id);
CREATE INDEX idx_community_file_community_id ON tbl_community_file (community_id);

-- ============================================================
-- 14. VIEW
-- ============================================================

-- 광고 이미지 조회
CREATE VIEW vw_file_advertisement AS
SELECT f.id, f.original_name, f.file_name, f.file_path, f.file_size,
       f.content_type, f.created_datetime,
       af.ad_id
FROM tbl_ad_file af
JOIN tbl_file f ON af.id = f.id;

-- 녹음 파일 조회
CREATE VIEW vw_file_recoding AS
SELECT f.id, f.original_name, f.file_name, f.file_path, f.file_size,
       f.content_type, f.created_datetime,
       vr.video_session_id
FROM tbl_video_recoding vr
JOIN tbl_file f ON vr.id = f.id;

-- 유저 프로필 사진 조회
CREATE VIEW vw_file_member AS
SELECT f.id, f.original_name, f.file_name, f.file_path, f.file_size,
       f.content_type, f.created_datetime,
       pf.member_id
FROM tbl_member_profile_file pf
JOIN tbl_file f ON pf.id = f.id;

-- 게시물 피드
CREATE VIEW view_post_feed AS
SELECT p.id,
       p.member_id,
       p.post_status,
       p.title          AS post_title,
       p.content        AS post_content,
       p.location,
       p.reply_post_id,
       p.created_datetime,
       p.updated_datetime,
       m.member_nickname,
       m.member_handle,
       (SELECT f.file_name
        FROM tbl_member_profile_file mpf
        JOIN tbl_file f ON mpf.id = f.id
        WHERE mpf.member_id = p.member_id AND mpf.profile_image_type = 'profile'
        LIMIT 1) AS member_profile_file_name,
       (SELECT count(*) FROM tbl_post_like pl WHERE pl.post_id = p.id) AS like_count,
       (SELECT count(*) FROM tbl_post rp WHERE rp.reply_post_id = p.id AND rp.post_status = 'active') AS reply_count,
       (SELECT count(*) FROM tbl_bookmark b WHERE b.post_id = p.id) AS bookmark_count,
       bg.badge_type,
       p.community_id,
       c.community_name
FROM tbl_post p
JOIN tbl_member m ON p.member_id = m.id
LEFT JOIN tbl_badge bg ON bg.member_id = p.member_id
LEFT JOIN tbl_community c ON p.community_id = c.id
WHERE p.post_status = 'active'
  AND p.reply_post_id IS NULL;

-- 커뮤니티 피드
CREATE VIEW view_community_feed AS
SELECT c.id,
       c.community_name,
       c.description,
       c.creator_id,
       c.community_status,
       c.category_id,
       cat.category_name,
       c.created_datetime,
       c.updated_datetime,
       (SELECT count(*) FROM tbl_community_member cm WHERE cm.community_id = c.id) AS member_count,
       (SELECT count(*) FROM tbl_post p WHERE p.community_id = c.id AND p.post_status = 'active' AND p.reply_post_id IS NULL) AS post_count,
       (SELECT f.file_path FROM tbl_community_file cf JOIN tbl_file f ON cf.id = f.id WHERE cf.community_id = c.id LIMIT 1) AS cover_file_path
FROM tbl_community c
LEFT JOIN tbl_category cat ON c.category_id = cat.id
WHERE c.community_status = 'active';

-- 채팅방 조회 (내 기준 상대방 정보 + 설정)
CREATE VIEW v_my_chat AS
SELECT c.id              AS conversation_id,
       rel.sender_id     AS member_id,
       rel.invited_id    AS partner_id,
       coalesce(partner.member_nickname, partner.member_name) AS partner_name,
       partner.member_handle AS partner_handle,
       cs.alias,
       coalesce(cs.alias, partner.member_nickname, partner.member_name) AS display_name,
       cs.last_read_message_id AS my_last_read,
       cs_partner.last_read_message_id AS partner_last_read,
       coalesce(cs.is_muted, false) AS is_muted,
       coalesce(cs.is_deleted, false) AS is_deleted,
       c.created_datetime,
       c.updated_datetime
FROM tbl_conversation c
JOIN tbl_conversation_member_rel rel ON c.id = rel.conversation_id
JOIN tbl_member partner ON partner.id = rel.invited_id
LEFT JOIN tbl_conversation_setting cs
    ON cs.conversation_id = c.id AND cs.member_id = rel.sender_id
LEFT JOIN tbl_conversation_setting cs_partner
    ON cs_partner.conversation_id = c.id AND cs_partner.member_id = rel.invited_id
UNION ALL
SELECT c.id              AS conversation_id,
       rel.invited_id    AS member_id,
       rel.sender_id     AS partner_id,
       coalesce(partner.member_nickname, partner.member_name) AS partner_name,
       partner.member_handle AS partner_handle,
       cs.alias,
       coalesce(cs.alias, partner.member_nickname, partner.member_name) AS display_name,
       cs.last_read_message_id AS my_last_read,
       cs_partner.last_read_message_id AS partner_last_read,
       coalesce(cs.is_muted, false) AS is_muted,
       coalesce(cs.is_deleted, false) AS is_deleted,
       c.created_datetime,
       c.updated_datetime
FROM tbl_conversation c
JOIN tbl_conversation_member_rel rel ON c.id = rel.conversation_id
JOIN tbl_member partner ON partner.id = rel.sender_id
LEFT JOIN tbl_conversation_setting cs
    ON cs.conversation_id = c.id AND cs.member_id = rel.invited_id
LEFT JOIN tbl_conversation_setting cs_partner
    ON cs_partner.conversation_id = c.id AND cs_partner.member_id = rel.sender_id;

-- 거래처 등록 목록 조회
CREATE VIEW vw_inquiry_member AS
SELECT m.id,
       m.member_nickname,
       m.member_handle,
       m.member_bio,
       m.member_status,
       m.member_role,
       tf.file_path,
       (SELECT c.category_name
        FROM tbl_member_category_rel mcr
        JOIN tbl_category c ON c.id = mcr.category_id
        WHERE mcr.member_id = m.id
        LIMIT 1) AS category_name,
       (SELECT m2.member_handle
        FROM tbl_follow f2
        JOIN tbl_member m2 ON m2.id = f2.following_id
        WHERE f2.follower_id = m.id
          AND m2.member_role = 'expert'
        ORDER BY (SELECT count(*) FROM tbl_follow f3 WHERE f3.following_id = m2.id) DESC
        LIMIT 1) AS expert_handle
FROM tbl_member m
LEFT JOIN tbl_member_profile_file mpf ON mpf.member_id = m.id
LEFT JOIN tbl_file tf ON tf.id = mpf.id;

-- ==========================================================
-- END OF DDL
-- ==========================================================
