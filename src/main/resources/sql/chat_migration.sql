

-- 0) 기존 의존 테이블 정리 (역순으로 drop)
drop table if exists tbl_chat_file;
drop table if exists tbl_message_deletion;
drop table if exists tbl_message_reaction;
drop table if exists tbl_message;
drop table if exists tbl_conversation_setting;
drop table if exists tbl_conversation_member_rel;
drop table if exists tbl_conversation;

-- 1) tbl_conversation - 채팅방
create table tbl_conversation (
    id                bigint    generated always as identity primary key,
    title             varchar(255),
    created_datetime  timestamp not null default now(),
    updated_datetime  timestamp not null default now()
);

-- 2) tbl_conversation_member_rel - 대화방 ↔ 회원 (n:n)
create table tbl_conversation_member_rel (
    id                bigint    generated always as identity primary key,
    conversation_id   bigint    not null,
    sender_id         bigint    not null,
    invited_id        bigint    not null,
    created_datetime  timestamp not null default now(),
    constraint fk_conversation_member_rel_conversation foreign key(conversation_id)
        references tbl_conversation(id),
    constraint fk_conversation_member_rel_member foreign key(sender_id)
        references tbl_member(id),
    constraint fk_conversation_invited_rel_member foreign key(invited_id)
        references tbl_member(id)
);

-- 3) tbl_conversation_setting - 대화방별 회원 개인 설정
create table tbl_conversation_setting (
    conversation_id       bigint       not null,
    member_id             bigint       not null,
    alias                 varchar(255),
    is_screen_blocked     boolean      not null default false,
    is_muted              boolean      not null default false,
    is_deleted            boolean      default false,
    deleted_after_message_id bigint    default null,
    is_pinned             boolean      not null default false,
    last_read_message_id  bigint,
    disappear_message     varchar(255) default 'none',
    created_datetime      timestamp    not null default now(),
    updated_datetime      timestamp    not null default now(),
    primary key (conversation_id, member_id),
    constraint fk_conversation_setting_conversation foreign key(conversation_id)
        references tbl_conversation(id),
    constraint fk_conversation_setting_member foreign key(member_id)
        references tbl_member(id)
);

-- 4) tbl_message - 채팅 메시지
create table tbl_message (
    id                bigint    generated always as identity primary key,
    conversation_id   bigint    not null,
    sender_id         bigint    not null,
    content           text      not null,
    reply_message_id  bigint,
    is_deleted        boolean   not null default false,
    created_datetime  timestamp not null default now(),
    updated_datetime  timestamp not null default now(),
    constraint fk_message_conversation foreign key(conversation_id)
        references tbl_conversation(id),
    constraint fk_message_sender foreign key(sender_id)
        references tbl_member(id)
);

-- 5) tbl_message_reaction - 메시지 이모지 반응
create table tbl_message_reaction (
    id                bigint       generated always as identity primary key,
    message_id        bigint       not null,
    member_id         bigint       not null,
    emoji             varchar(255) not null,
    created_datetime  timestamp    not null default now(),
    constraint fk_message_reaction_message foreign key(message_id)
        references tbl_message(id),
    constraint fk_message_reaction_member foreign key(member_id)
        references tbl_member(id)
);

-- 6) tbl_message_deletion - 내 계정에서만 메시지 삭제 (per-member soft delete)
create table tbl_message_deletion (
    message_id        bigint    not null,
    member_id         bigint    not null,
    deleted_datetime  timestamp not null default now(),
    primary key (message_id, member_id),
    constraint fk_msg_del_message foreign key (message_id) references tbl_message(id),
    constraint fk_msg_del_member  foreign key (member_id)  references tbl_member(id)
);

-- 7) tbl_chat_file - 채팅 첨부파일
create table tbl_chat_file (
    id          bigint not null primary key,
    message_id  bigint not null,
    constraint fk_chat_file_file foreign key(id) references tbl_file(id),
    constraint fk_chat_file_message foreign key(message_id) references tbl_message(id)
);

-- 8) tbl_block - 사용자 차단 (없으면 생성)
create table if not exists tbl_block (
    id                bigint    generated always as identity primary key,
    blocker_id        bigint    not null references tbl_member(id),
    blocked_id        bigint    not null references tbl_member(id),
    created_datetime  timestamp default now(),
    unique(blocker_id, blocked_id)
);

-- 9) v_my_chat view
drop view if exists v_conversation_partner;
drop view if exists v_my_chat;

create view v_my_chat as
select
    c.id              as conversation_id,
    rel.sender_id     as member_id,
    rel.invited_id    as partner_id,
    coalesce(partner.member_nickname, partner.member_name) as partner_name,
    partner.member_handle as partner_handle,
    cs.alias,
    coalesce(cs.alias, partner.member_nickname, partner.member_name) as display_name,
    cs.last_read_message_id as my_last_read,
    cs_partner.last_read_message_id as partner_last_read,
    coalesce(cs.is_muted, false) as is_muted,
    coalesce(cs.is_deleted, false) as is_deleted,
    c.created_datetime,
    c.updated_datetime
from tbl_conversation c
join tbl_conversation_member_rel rel on c.id = rel.conversation_id
join tbl_member partner on partner.id = rel.invited_id
left join tbl_conversation_setting cs
    on cs.conversation_id = c.id and cs.member_id = rel.sender_id
left join tbl_conversation_setting cs_partner
    on cs_partner.conversation_id = c.id and cs_partner.member_id = rel.invited_id
union all
select
    c.id              as conversation_id,
    rel.invited_id    as member_id,
    rel.sender_id     as partner_id,
    coalesce(partner.member_nickname, partner.member_name) as partner_name,
    partner.member_handle as partner_handle,
    cs.alias,
    coalesce(cs.alias, partner.member_nickname, partner.member_name) as display_name,
    cs.last_read_message_id as my_last_read,
    cs_partner.last_read_message_id as partner_last_read,
    coalesce(cs.is_muted, false) as is_muted,
    coalesce(cs.is_deleted, false) as is_deleted,
    c.created_datetime,
    c.updated_datetime
from tbl_conversation c
join tbl_conversation_member_rel rel on c.id = rel.conversation_id
join tbl_member partner on partner.id = rel.sender_id
left join tbl_conversation_setting cs
    on cs.conversation_id = c.id and cs.member_id = rel.invited_id
left join tbl_conversation_setting cs_partner
    on cs_partner.conversation_id = c.id and cs_partner.member_id = rel.sender_id;
