-- 로컬 DB에 tbl_post_product.product_category_id 컬럼이 없을 때 추가하는 migration
-- 기존 mapper / service 코드에서 상품 카테고리 FK를 기대하고 있으므로 먼저 컬럼을 맞춘다.

alter table tbl_post_product
    add column if not exists product_category_id bigint;

alter table tbl_post_product
    drop constraint if exists fk_post_product_category;

alter table tbl_post_product
    add constraint fk_post_product_category
        foreign key (product_category_id) references tbl_category(id);
