-- 사라진 메시지 윈도우 모델 도입에 따른 컬럼 추가
-- (windowed-mode: 활성화 시점 ~ 만료 시점까지의 메시지만 일괄 삭제 + 자동 비활성화)
--
-- 적용 대상 환경: globalgates_full_ddl.sql 기준 disappear_activated_at 컬럼이 없는 기존 DB
-- 영향: 신규 컬럼 NULL 추가만 — 기존 데이터/동작 영향 없음
-- 작성: chat 모듈 disappear 재설계 (2026-04-29)

ALTER TABLE tbl_conversation_setting
    ADD COLUMN IF NOT EXISTS disappear_activated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;
