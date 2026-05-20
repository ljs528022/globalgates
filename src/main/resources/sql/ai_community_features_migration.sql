-- AI 추천 시스템 — 커뮤니티 보강 데이터
-- 운영 tbl_community 에는 tags 컬럼이 없으므로,
-- 추천 입력용 보강 데이터를 별도 AI 전용 테이블에 분리한다.

-- 책임 분리 원칙:
--   tbl_community              ← Spring 운영팀이 관리하는 원본
--   tbl_ai_community_features  ← AI 팀이 관리하는 추천 입력 보강

-- 향후 V2 (협업 필터링) 도입 시점에 tbl_ai_recommend_log 를 추가하고,
-- V2.5 (의미 검색) 도입 시점에 tbl_ai_community_embedding 을 추가한다.
-- 지금은 V1 — TF-IDF in-memory 만 필요하므로 features 테이블 1개로 충분하다.

DROP TABLE IF EXISTS tbl_ai_community_features;

CREATE TABLE tbl_ai_community_features (
    community_id  bigint    PRIMARY KEY
                            REFERENCES tbl_community(id) ON DELETE CASCADE,
    tags          text      NOT NULL DEFAULT '',
    updated_at    timestamp NOT NULL DEFAULT now()
);

COMMENT ON TABLE  tbl_ai_community_features              IS 'AI 추천 시스템 전용 — 커뮤니티 보강 데이터 (운영 tbl_community 와 분리)';
COMMENT ON COLUMN tbl_ai_community_features.community_id IS 'tbl_community.id FK — 1:1 관계';
COMMENT ON COLUMN tbl_ai_community_features.tags         IS '추천 입력용 콤마 구분 태그. 예: "수출,서류,FTA,인보이스"';
COMMENT ON COLUMN tbl_ai_community_features.updated_at   IS '태그 갱신 시각';
