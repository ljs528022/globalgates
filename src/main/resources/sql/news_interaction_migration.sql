-- 뉴스 좋아요/북마크/댓글 상호작용 테이블 신설
-- 적용: psql -d globalgates -f src/main/resources/sql/news_interaction_migration.sql

-- 뉴스 좋아요
CREATE TABLE IF NOT EXISTS tbl_news_like (
    id               BIGSERIAL PRIMARY KEY,
    member_id        BIGINT    NOT NULL REFERENCES tbl_member(id) ON DELETE CASCADE,
    news_id          BIGINT    NOT NULL REFERENCES tbl_news(id)   ON DELETE CASCADE,
    created_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_news_like UNIQUE (member_id, news_id)
);
CREATE INDEX IF NOT EXISTS idx_news_like_news ON tbl_news_like (news_id);

-- 뉴스 북마크 (기존 tbl_bookmark_folder 재사용)
CREATE TABLE IF NOT EXISTS tbl_news_bookmark (
    id               BIGSERIAL PRIMARY KEY,
    member_id        BIGINT    NOT NULL REFERENCES tbl_member(id)          ON DELETE CASCADE,
    news_id          BIGINT    NOT NULL REFERENCES tbl_news(id)            ON DELETE CASCADE,
    folder_id        BIGINT             REFERENCES tbl_bookmark_folder(id) ON DELETE SET NULL,
    created_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_news_bookmark UNIQUE (member_id, news_id)
);
CREATE INDEX IF NOT EXISTS idx_news_bookmark_news   ON tbl_news_bookmark (news_id);
CREATE INDEX IF NOT EXISTS idx_news_bookmark_folder ON tbl_news_bookmark (folder_id);

-- 뉴스 댓글 (트위터식 평면 구조, parent_reply_id 미사용)
CREATE TABLE IF NOT EXISTS tbl_news_reply (
    id               BIGSERIAL    PRIMARY KEY,
    member_id        BIGINT       NOT NULL REFERENCES tbl_member(id) ON DELETE CASCADE,
    news_id          BIGINT       NOT NULL REFERENCES tbl_news(id)   ON DELETE CASCADE,
    content          TEXT         NOT NULL,
    reply_status     VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_datetime TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_datetime TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_news_reply_news   ON tbl_news_reply (news_id);
CREATE INDEX IF NOT EXISTS idx_news_reply_member ON tbl_news_reply (member_id);

-- 뉴스 댓글 좋아요 (인기순 정렬 기준)
CREATE TABLE IF NOT EXISTS tbl_news_reply_like (
    id               BIGSERIAL PRIMARY KEY,
    member_id        BIGINT    NOT NULL REFERENCES tbl_member(id)     ON DELETE CASCADE,
    reply_id         BIGINT    NOT NULL REFERENCES tbl_news_reply(id) ON DELETE CASCADE,
    created_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_news_reply_like UNIQUE (member_id, reply_id)
);
CREATE INDEX IF NOT EXISTS idx_news_reply_like_reply ON tbl_news_reply_like (reply_id);
