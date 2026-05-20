package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsBookmarkDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface NewsBookmarkMapper {
    void insert(NewsBookmarkDTO newsBookmarkDTO);

    void deleteByMemberIdAndNewsId(@Param("memberId") Long memberId, @Param("newsId") Long newsId);

    Optional<NewsBookmarkDTO> selectByMemberIdAndNewsId(@Param("memberId") Long memberId, @Param("newsId") Long newsId);

    int selectCountByNewsId(Long newsId);

    Optional<NewsBookmarkDTO> selectById(@Param("id") Long id);

    void updateFolderId(NewsBookmarkDTO newsBookmarkDTO);

    void clearFolderId(@Param("folderId") Long folderId);
}
