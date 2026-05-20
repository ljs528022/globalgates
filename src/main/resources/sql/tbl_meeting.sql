create table tbl_meeting (
    id bigint generated always as identity primary key,
    requester_id bigint not null,
    acceptor_id bigint not null,
    title varchar(255),
    content text,
    created_datetime timestamp not null default now(),
    updated_datetime timestamp not null default now(),
    constraint fk_meeting_requester foreign key (requester_id)
    references tbl_member (id),
    constraint fk_meeting_acceptor foreign key (acceptor_id)
    references tbl_member (id)
);

-- 오디오 파일 녹화 길이 컬럼 추가
alter table tbl_video_recoding add column recoding_time int not null;

-- 의존성 때문에 vw 삭제해야함
drop view vw_file_recoding;

-- 1. video_session_id FK 제약 해제 및 컬럼 삭제
ALTER TABLE tbl_video_recoding DROP CONSTRAINT IF EXISTS fk_recoding_session;
ALTER TABLE tbl_video_recoding DROP COLUMN IF EXISTS video_session_id;

-- 2. meeting_id 컬럼 추가 및 FK 설정
ALTER TABLE tbl_video_recoding ADD COLUMN meeting_id bigint not null;
ALTER TABLE tbl_video_recoding ADD CONSTRAINT fk_video_recoding_meeting
    FOREIGN KEY (meeting_id) REFERENCES tbl_meeting (id);

-- 다시 view 생성
create view vw_file_recoding as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    vr.recoding_time, vr.meeting_id
from tbl_video_recoding vr
join tbl_meeting m on vr.meeting_id = m.id
join tbl_file f on vr.id = f.id;

alter table tbl_video_recoding alter column meeting_id set not null;

