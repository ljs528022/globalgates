-- ============ ENUM 타입 전부 ============

create type file_content_type as enum ('image', 'video', 'document', 'etc');
create type member_status as enum ('active', 'inactive', 'banned');
create type member_role as enum ('business', 'expert', 'admin');
create type oauth_provider as enum ('kakao', 'facebook', 'naver');
create type profile_type as enum ('profile', 'banner');
create type post_status as enum ('active', 'inactive');
create type estimation_status as enum ('approve', 'requesting', 'reject');
create type notification_type as enum ('connect', 'approve', 'like', 'post', 'reply', 'message', 'estimation', 'system', 'handle');
create type subscription_tier as enum ('free', 'pro', 'pro_plus', 'expert');
create type subscription_status as enum ('active', 'inactive', 'expired');
create type payment_status as enum ('pending', 'completed', 'cancelled', 'failed');
create type report_status as enum ('pending', 'applied', 'rejected');
create type report_target_type as enum ('post', 'member');
create type badge_type as enum ('pro', 'pro_plus', 'expert');
create type news_type as enum ('general', 'emergency');
create type news_category_type as enum ('trade', 'market', 'policy', 'technology', 'etc');
create type ad_status as enum ('active', 'reported', 'expired');

-- ============ 독립 테이블 (FK 없음) ============

-- [2] tbl_file
create table tbl_file (
    id            bigint             generated always as identity primary key,
    original_name varchar(255)       not null,
    file_name     varchar(255)       not null,
    file_path     varchar(255)       not null,
    file_size     bigint             not null default 0,
    content_type  file_content_type  not null default 'image',
    created_datetime timestamp       not null default now()
);

-- [3] tbl_member
create table tbl_member (
    id                bigint        generated always as identity primary key,
    member_name       varchar(255),
    member_email      varchar(255)  not null unique,
    member_password   varchar(255),
    member_handle     varchar(255)  unique not null,
    member_phone      varchar(255),
    member_bio        text,
    member_region     varchar(255),
    member_status     member_status not null default 'active',
    member_role       member_role   not null default 'business',
    push_enabled      boolean       not null default true,
    website_url       varchar(255),
    birth_date        varchar(255),
    created_datetime  timestamp     not null default now(),
    updated_datetime  timestamp     not null default now(),
    last_login_at     timestamp
);

-- [8] tbl_category
create table tbl_category (
    id                         bigint       generated always as identity primary key,
    product_category_parent_id bigint,
    category_name              varchar(255) not null unique,
    created_datetime           timestamp    not null default now(),
    constraint fk_product_category_parent_id_category foreign key(product_category_parent_id) references tbl_category(id)
);

-- [34] tbl_conversation
create table tbl_conversation (
    id               bigint    generated always as identity primary key,
    title            varchar(255),
    created_datetime timestamp not null default now(),
    updated_datetime timestamp not null default now()
);

-- [14] tbl_post_hashtag
create table tbl_post_hashtag (
    id               bigint       generated always as identity primary key,
    tag_name         varchar(255) not null unique,
    created_datetime timestamp    not null default now()
);

-- [31] tbl_estimation_tag
create table tbl_estimation_tag (
    id               bigint       generated always as identity primary key,
    tag_name         varchar(255) not null unique,
    created_datetime timestamp    not null default now()
);

-- [55] tbl_community
create table tbl_community (
    id               bigint       generated always as identity primary key,
    community_name   varchar(255) not null,
    description      text,
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now()
);

-- ============ tbl_member 의존 테이블 ============

-- [1] tbl_address
create table tbl_address (
    id               bigint       generated always as identity primary key,
    postal_code      varchar(255) not null,
    country          varchar(255) not null,
    country_code     varchar(255) not null,
    address1         varchar(255) not null,
    address2         varchar(255),
    city             varchar(255),
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now(),
    constraint fk_address_member foreign key(id) references tbl_member(id)
);

-- [4] tbl_business_member
create table tbl_business_member (
    id               bigint       primary key,
    business_number  varchar(255) not null unique,
    company_name     varchar(255) not null,
    ceo_name         varchar(255) not null,
    business_type    varchar(255),
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now(),
    constraint fk_business_member_member foreign key(id) references tbl_member(id)
);

-- [5] tbl_oauth
create table tbl_oauth (
    id               bigint         generated always as identity primary key,
    provider_id      varchar(255)   unique not null,
    provider         oauth_provider not null,
    profile_url      varchar(255),
    member_id        bigint         not null,
    created_datetime timestamp      not null default now(),
    updated_datetime timestamp      default now(),
    constraint fk_oauth_member foreign key(member_id) references tbl_member(id)
);

-- [6] tbl_member_profile_file
create table tbl_member_profile_file (
    id                 bigint       not null primary key,
    member_id          bigint       not null,
    profile_image_type profile_type default 'profile',
    constraint fk_file_member_profile_file foreign key(id) references tbl_file(id),
    constraint fk_file_member foreign key(member_id) references tbl_member(id)
);

-- ============ tbl_post 및 의존 테이블 ============

-- [12] tbl_post
create table tbl_post (
    id               bigint      generated always as identity primary key,
    member_id        bigint      not null,
    post_status      post_status not null default 'active',
    title            varchar(255),
    content          text        not null,
    location         varchar(255),
    reply_post_id    bigint,
    product_id bigint,
    created_datetime timestamp   not null default now(),
    updated_datetime timestamp   not null default now(),
    constraint fk_post_member foreign key(member_id) references tbl_member(id),
    constraint fk_post_reply_post foreign key(reply_post_id) references tbl_post(id)
);

-- [13] tbl_post_product
create table tbl_post_product (
    id                  bigint    primary key,
    product_category_id bigint,
    product_price       int       not null,
    product_stock       int       not null,
    created_datetime    timestamp not null default now(),
    updated_datetime    timestamp not null default now(),
    constraint fk_post_product_post foreign key(id) references tbl_post(id)
);

-- [15] tbl_post_hashtag_rel
create table tbl_post_hashtag_rel (
    id               bigint generated always as identity primary key,
    post_id          bigint not null,
    hashtag_id       bigint not null,
    constraint fk_post_hashtag_rel_post foreign key(post_id) references tbl_post(id),
    constraint fk_post_hashtag_rel_hashtag foreign key(hashtag_id) references tbl_post_hashtag(id)
);

-- [16] tbl_post_like
create table tbl_post_like (
    id               bigint    generated always as identity primary key,
    member_id        bigint    not null,
    post_id          bigint    not null,
    created_datetime timestamp not null default now(),
    constraint fk_post_like_member foreign key(member_id) references tbl_member(id),
    constraint fk_post_like_post foreign key(post_id) references tbl_post(id)
);

-- [18] tbl_post_file
create table tbl_post_file (
    id               bigint generated always as identity primary key,
    post_id          bigint not null,
    file_id          bigint not null,
    constraint fk_post_file_file foreign key(file_id) references tbl_file(id),
    constraint fk_post_file_post foreign key(post_id) references tbl_post(id)
);

-- [19] tbl_bookmark_folder
create table tbl_bookmark_folder (
    id               bigint       generated always as identity primary key,
    member_id        bigint       not null,
    folder_name      varchar(255) not null,
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now(),
    constraint fk_bookmark_folder_member foreign key(member_id) references tbl_member(id)
);

-- [20] tbl_bookmark
create table tbl_bookmark (
    id               bigint    generated always as identity primary key,
    member_id        bigint    not null,
    post_id          bigint    not null,
    folder_id        bigint,
    created_datetime timestamp not null default now(),
    constraint fk_bookmark_member foreign key(member_id) references tbl_member(id),
    constraint fk_bookmark_post foreign key(post_id) references tbl_post(id),
    constraint fk_bookmark_folder foreign key(folder_id) references tbl_bookmark_folder(id)
);

-- ============ 견적 ============

-- [28] tbl_estimation
create table tbl_estimation (
    id               bigint            generated always as identity primary key,
    requester_id     bigint            not null,
    receiver_id      bigint,
    product_id       bigint,
    title            varchar(255)      not null,
    content          text              not null,
    deadline         date,
    status           estimation_status not null default 'approve',
    created_datetime timestamp         not null default now(),
    updated_datetime timestamp         not null default now(),
    constraint fk_estimation_product foreign key(product_id) references tbl_post(id),
    constraint fk_estimation_requester foreign key(requester_id) references tbl_member(id),
    constraint fk_estimation_receiver foreign key(receiver_id) references tbl_member(id)
);

-- [32] tbl_estimation_tag_rel
create table tbl_estimation_tag_rel (
    estimation_id bigint not null,
    tag_id        bigint not null,
    primary key (estimation_id, tag_id),
    constraint fk_estimation_tag_rel_estimation foreign key(estimation_id) references tbl_estimation(id),
    constraint fk_estimation_tag_rel_tag foreign key(tag_id) references tbl_estimation_tag(id)
);

-- ============ 채팅 ============

-- [35] tbl_conversation_member_rel
create table tbl_conversation_member_rel (
    id               bigint    generated always as identity primary key,
    conversation_id  bigint    not null,
    sender_id        bigint    not null,
    invited_id       bigint    not null,
    created_datetime timestamp not null default now(),
    constraint fk_conversation_member_rel_conversation foreign key(conversation_id) references tbl_conversation(id),
    constraint fk_conversation_member_rel_member foreign key(sender_id) references tbl_member(id),
    constraint fk_conversation_invited_rel_member foreign key(invited_id) references tbl_member(id)
);

-- [36] tbl_conversation_setting
create table tbl_conversation_setting (
    conversation_id      bigint  primary key,
    member_id            bigint  not null,
    is_screen_blocked    boolean not null default false,
    is_muted             boolean not null default false,
    is_pinned            boolean not null default false,
    last_read_message_id bigint,
    disappear_message    varchar(255) default 'none',
    created_datetime     timestamp    not null default now(),
    updated_datetime     timestamp    not null default now(),
    constraint fk_conversation_setting_conversation foreign key(conversation_id) references tbl_conversation(id),
    constraint fk_conversation_setting_member foreign key(member_id) references tbl_member(id)
);

-- [37] tbl_message
create table tbl_message (
    id               bigint    generated always as identity primary key,
    conversation_id  bigint    not null,
    sender_id        bigint    not null,
    content          text      not null,
    is_deleted       boolean   not null default false,
    created_datetime timestamp not null default now(),
    constraint fk_message_conversation foreign key(conversation_id) references tbl_conversation(id),
    constraint fk_message_sender foreign key(sender_id) references tbl_member(id)
);

-- [38] tbl_message_reaction
create table tbl_message_reaction (
    message_id       bigint       not null,
    emoji            varchar(255) not null,
    created_datetime timestamp    not null default now(),
    constraint fk_message_reaction_message foreign key(message_id) references tbl_message(id)
);

-- [39] tbl_chat_file
create table tbl_chat_file (
    id         bigint not null primary key,
    message_id bigint not null,
    constraint fk_chat_file_file foreign key(id) references tbl_file(id),
    constraint fk_chat_file_message foreign key(message_id) references tbl_message(id)
);

-- ============ 팔로우 / 알림 / 구독 ============

-- [40] tbl_follow
create table tbl_follow (
    id               bigint    generated always as identity primary key,
    follower_id      bigint    not null,
    following_id     bigint    not null,
    created_datetime timestamp not null default now(),
    check (follower_id <> following_id),
    constraint fk_follow_follower foreign key(follower_id) references tbl_member(id),
    constraint fk_follow_following foreign key(following_id) references tbl_member(id)
);

-- [42] tbl_notification
create table tbl_notification (
    id                bigint            generated always as identity primary key,
    recipient_id      bigint            not null,
    sender_id         bigint,
    notification_type notification_type not null,
    title             varchar(255)      not null,
    content           text              not null,
    target_id         bigint,
    target_type       varchar(255),
    is_read           boolean           not null default false,
    created_datetime  timestamp         not null default now(),
    constraint fk_notification_recipient foreign key(recipient_id) references tbl_member(id),
    constraint fk_notification_sender foreign key(sender_id) references tbl_member(id)
);

-- [43] tbl_subscription
create table tbl_subscription (
    id               bigint              generated always as identity primary key,
    member_id        bigint              not null,
    tier             subscription_tier   not null default 'free',
    billing_cycle    varchar(255)        not null default 'monthly',
    status           subscription_status not null default 'active',
    started_at       timestamp           not null default now(),
    expires_at       timestamp           not null,
    created_datetime timestamp           not null default now(),
    updated_datetime timestamp           not null default now(),
    quartz boolean default true,
    next_tier varchar(255) default null,
    next_billing_cycle varchar(255) default null,
    constraint fk_subscription_member foreign key(member_id)
    references tbl_member(id)
);

-- ============ 광고 (advertisement 먼저, payment 나중) ============

-- [49] tbl_advertisement
create table tbl_advertisement (
    id                  bigint         generated always as identity primary key,
    advertiser_id       bigint         not null,
    title               varchar(255)   not null,
    headline            varchar(255)   not null,
    description         text,
    landing_url         varchar(255)   not null,
    budget              numeric(15, 2) not null default 0,
    impression_estimate int            not null default 0,
    receipt_id          varchar(255),
    status              ad_status      not null default 'active',
    started_at          timestamp,
    created_datetime    timestamp      not null default now(),
    updated_datetime    timestamp      not null default now(),
    constraint fk_advertisement_advertiser foreign key(advertiser_id) references tbl_member(id)
);

-- [50] tbl_ad_file
create table tbl_ad_file (
    id    bigint not null primary key,
    ad_id bigint not null,
    constraint fk_ad_file_file foreign key(id) references tbl_file(id),
    constraint fk_ad_file_ad foreign key(ad_id) references tbl_advertisement(id)
);

create table tbl_tag_for_ad (
   id                         bigint       generated always as identity primary key,
   tag_name                   varchar(255) not null unique,
   created_datetime           timestamp    not null default now()
);

create table tbl_ad_tag (
    id     bigint generated always as identity primary key,
    ad_id  bigint not null,
    tag_id bigint not null,
    constraint fk_ad_ad_tag foreign key(ad_id) references tbl_advertisement(id),
    constraint fk_tag_ad_tag foreign key(tag_id) references tbl_tag_for_ad(id)
);

-- ============ 결제 (advertisement, subscription 이후) ============

-- [44] tbl_payment_advertisement
create table tbl_payment_advertisement (
    id               bigint         generated always as identity primary key,
    ad_id            bigint         not null,
    member_id        bigint         not null,
    amount           numeric(15, 2) not null,
    payment_status   payment_status not null default 'pending',
    payment_method   varchar(255),
    receipt_id       varchar(255),
    paid_at          timestamp,
    created_datetime timestamp      not null default now(),
    constraint fk_payment_advertisement foreign key(ad_id) references tbl_advertisement(id),
    constraint fk_payment_advertisement_member foreign key(member_id) references tbl_member(id)
);

-- tbl_payment_subscribe
create table tbl_payment_subscribe (
    id               bigint         generated always as identity primary key,
    subscription_id  bigint         not null,
    member_id        bigint         not null,
    amount           numeric(15, 2) not null,
    payment_status   payment_status not null default 'pending',
    payment_method   varchar(255),
    receipt_id       varchar(255),
    paid_at          timestamp,
    created_datetime timestamp      not null default now(),
    constraint fk_payment_subscription foreign key(subscription_id) references tbl_subscription(id),
    constraint fk_payment_member foreign key(member_id) references tbl_member(id)
);

-- ============ 신고 / 뱃지 / 뉴스 ============

-- [45] tbl_report
create table tbl_report (
    id               bigint             generated always as identity primary key,
    reporter_id      bigint             not null,
    target_id        bigint             not null,
    target_type      report_target_type not null,
    reason           text               not null,
    status           report_status      not null default 'pending',
    created_datetime timestamp          not null default now(),
    updated_datetime timestamp          not null default now(),
    constraint fk_report_reporter foreign key(reporter_id) references tbl_member(id)
);

-- [46] tbl_badge
create table tbl_badge (
    id               bigint     generated always as identity primary key,
    member_id        bigint     not null,
    badge_type       badge_type not null,
    created_datetime timestamp  not null default now(),
    updated_datetime timestamp,
    constraint fk_badge_member foreign key(member_id) references tbl_member(id)
);

-- [47] tbl_news
create table tbl_news (
    id               bigint             generated always as identity primary key,
    admin_id         bigint,
    news_title       varchar(255)       not null,
    news_content     text               not null,
    news_source_url  varchar(255),
    news_category    news_category_type not null default 'etc',
    news_type        news_type          not null default 'general',
    published_at     timestamp,
    post_id          bigint,
    created_datetime timestamp          not null default now(),
    updated_datetime timestamp          not null default now(),
    constraint fk_news_admin foreign key(admin_id)
    references tbl_member(id),
    constraint fk_news_post foreign key (post_id)
    references tbl_post(id)
);

-- ============ 화상 / 커뮤니티 / 트렌딩 / 설정 / 차단 / 뮤트 / 검색 ============

-- [51] tbl_video_session
create table tbl_video_session (
    id               bigint    generated always as identity primary key,
    conversation_id  bigint    not null,
    caller_id        bigint    not null,
    receiver_id      bigint    not null,
    started_at       timestamp not null default now(),
    ended_at         timestamp,
    duration_sec     int       default 0,
    created_datetime timestamp not null default now(),
    constraint fk_video_session_conversation foreign key(conversation_id) references tbl_conversation(id),
    constraint fk_video_session_caller foreign key(caller_id) references tbl_member(id),
    constraint fk_video_session_receiver foreign key(receiver_id) references tbl_member(id)
);

-- [56] tbl_community_member
create table tbl_community_member (
    community_id bigint    not null,
    member_id    bigint    not null,
    joined_at    timestamp not null default now(),
    primary key (community_id, member_id),
    constraint fk_community_member_community foreign key(community_id) references tbl_community(id),
    constraint fk_community_member_member foreign key(member_id) references tbl_member(id)
);

-- [61] tbl_trending
create table tbl_trending (
    id               bigint       generated always as identity primary key,
    hashtag_id       bigint,
    keyword          varchar(255),
    region           varchar(255),
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp,
    constraint fk_trending_hashtag foreign key(hashtag_id) references tbl_post_hashtag(id)
);

-- [62] tbl_notification_preference
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

-- [63] tbl_block
create table tbl_block (
    id               bigint    generated always as identity primary key,
    blocker_id       bigint    not null,
    blocked_id       bigint    not null,
    created_datetime timestamp not null default now(),
    check (blocker_id <> blocked_id),
    constraint fk_block_blocker foreign key(blocker_id) references tbl_member(id),
    constraint fk_block_blocked foreign key(blocked_id) references tbl_member(id)
);

-- [64] tbl_mute
create table tbl_mute (
    id               bigint    generated always as identity primary key,
    muter_id         bigint    not null,
    muted_id         bigint    not null,
    created_datetime timestamp not null default now(),
    check (muter_id <> muted_id),
    constraint fk_mute_muter foreign key(muter_id) references tbl_member(id),
    constraint fk_mute_muted foreign key(muted_id) references tbl_member(id)
);

-- [65] tbl_muted_word
create table tbl_muted_word (
    id               bigint       generated always as identity primary key,
    member_id        bigint       not null,
    word             varchar(255) not null,
    scope            varchar(255) not null default 'timeline',
    audience         varchar(255) not null default 'everyone',
    duration         varchar(255) not null default 'forever',
    expires_at       timestamp,
    created_datetime timestamp    not null default now(),
    constraint fk_muted_word_member foreign key(member_id) references tbl_member(id)
);

-- tbl_mention
create table tbl_mention (
    id                bigint generated always as identity primary key,
    mention_tagger_id bigint not null,
    mention_tagged_id bigint not null,
    post_id           bigint not null,
    constraint fk_mention_tagger foreign key(mention_tagger_id) references tbl_member(id),
    constraint fk_mention_tagged foreign key(mention_tagged_id) references tbl_member(id),
    constraint fk_mention_post foreign key(post_id) references tbl_post(id)
);

-- [66] tbl_search_history
create table tbl_search_history (
    id               bigint       generated always as identity primary key,
    member_id        bigint       not null,
    search_keyword   varchar(255) not null,
    search_count     int          default 0,
    created_datetime timestamp    not null default now(),
    constraint fk_search_history_member foreign key(member_id) references tbl_member(id)
);

-- [67] tbl_post_temp
create table tbl_post_temp (
    id                bigint       generated always as identity primary key,
    member_id         bigint       not null,
    post_temp_content text         not null,
    post_temp_location text,
    post_temp_tags text,
    created_datetime  timestamp    not null default now(),
    updated_datetime  timestamp    not null default now(),
    constraint fk_post_temp_member foreign key(member_id) references tbl_member(id)
);
