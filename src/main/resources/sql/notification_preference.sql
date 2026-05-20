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
select * from tbl_notification_preference;