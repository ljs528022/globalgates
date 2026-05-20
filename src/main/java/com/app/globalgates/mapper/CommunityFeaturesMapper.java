package com.app.globalgates.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

// tbl_ai_community_features 전용 매퍼.
// 운영 tbl_community 와 책임 분리 — AI 추천 입력용 보강 데이터만 다룬다.
@Mapper
public interface CommunityFeaturesMapper {

    // 생성/수정 시 tags 를 upsert. tags 가 null 이면 빈 문자열로 INSERT.
    void upsertTags(@Param("communityId") Long communityId, @Param("tags") String tags);
}
