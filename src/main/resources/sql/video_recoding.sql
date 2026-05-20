alter type file_content_type add value 'audio';

create table tbl_video_recoding (
id bigint not null primary key,
video_session_id bigint not null,                    -- tbl_video_session FK
constraint fk_file_recoding foreign key (id)
references tbl_file (id),
constraint fk_recoding_session foreign key (video_session_id)
references tbl_video_session (id)
);

