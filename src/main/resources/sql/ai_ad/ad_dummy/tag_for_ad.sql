insert into tbl_tag_for_ad (tag_name) values
('패션'), ('뷰티'), ('음식'), ('게임'),
('가전'), ('디지털'), ('여행'), ('숙박'),
('교육'), ('학원'), ('금융'), ('운동'),
('인테리어'), ('가구'), ('반려동물'), ('도서');

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

select * from tbl_tag_for_ad;