alter table tbl_estimation
add column if not exists location varchar(255);


insert into tbl_member (
    member_name,
    member_email,
    member_password,
    member_nickname,
    member_handle,
    member_phone,
    member_bio,
    member_region,
    member_role
) values (
             '전문가A',
             'expert_a@test.com',
             '$2a$10$dXJ3SW6G7P50lGmMQgel2.a6FvGU3H3XZ/1MlYH45cLwDwI1Gt2Kq',
             '전문가A',
             '@expert_a',
             '01011112222',
             '견적 테스트용 전문가 계정',
             '서울',
             'expert'
         );

-- lee@test.com의 member id 확인
select id, member_email, member_role
from tbl_member
where member_email = 'lee@test.com';

-- 그 전문가한테 들어온 견적 확인
select id, requester_id, receiver_id, product_id, title, content, status, created_datetime
from tbl_estimation
where receiver_id = (
    select id from tbl_member where member_email = 'lee@test.com'
)
order by id desc;

-- 태그까지 같이 확인
select e.id as estimation_id, e.title, t.tag_name
from tbl_estimation e
         left join tbl_estimation_tag_rel r on e.id = r.estimation_id
         left join tbl_estimation_tag t on r.tag_id = t.id
where e.receiver_id = (
    select id from tbl_member where member_email = 'lee@test.com'
)
order by e.id desc, t.tag_name;

---------------------
select *
from tbl_estimation
order by id desc;

-- lee@test.com한테 온 것만 보려면
select *
from tbl_estimation
where receiver_id = (
    select id from tbl_member where member_email = 'lee@test.com'
)
order by id desc;


