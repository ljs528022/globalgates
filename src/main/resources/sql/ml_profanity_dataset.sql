-- ml_profanity_dataset - 채팅 비속어 분류기 학습 데이터셋 (이진분류)

-- 이전 버전 정리 (재실행 안전 · 기존 데이터 전부 삭제)
drop table    if exists tbl_ml_profanity_dataset       cascade;
drop view     if exists v_ml_profanity_distribution    cascade;
drop view     if exists v_ml_profanity_balanced_preview cascade;
drop function if exists fn_touch_updated_datetime()    cascade;
drop type     if exists profanity_target               cascade;
drop type     if exists profanity_label                cascade;
drop type     if exists profanity_source               cascade;

create type profanity_target as enum ('clean', 'abusive');

create table tbl_ml_profanity_dataset (
    content text primary key,  -- pk | 채팅 메시지 본문 (학습 입력)
    target profanity_target not null      -- 라벨 (clean / abusive)
);
