-- 메인 피드 게시글 작성 시 자기 상품을 첨부할 수 있도록
-- tbl_post 와 tbl_post_product 사이에 첨부 관계 테이블을 둔다.
-- 기존 tbl_reply_product_rel(댓글 ↔ 상품) 패턴과 동일하게 별도 id PK + 두 FK 구조이며,
-- post 1개당 첨부 상품은 1개로 제한하기 위해 post_id 에 unique 제약을 둔다.

create table tbl_post_product_rel (
    id                bigint       generated always as identity primary key,
    post_id           bigint       not null,
    product_post_id   bigint       not null,
    created_datetime  timestamp    not null default now(),
    constraint uk_post_product_rel_post_id unique (post_id),
    constraint fk_post_product_rel_post
    foreign key (post_id) references tbl_post(id),
    constraint fk_post_product_rel_product
    foreign key (product_post_id) references tbl_post_product(id)
);

