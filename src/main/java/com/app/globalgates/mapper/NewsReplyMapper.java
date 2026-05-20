package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsReplyDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface NewsReplyMapper {
    void insert(NewsReplyDTO newsReplyDTO);

    Optional<NewsReplyDTO> selectById(Long id);

    List<NewsReplyDTO> selectByNewsId(@Param("newsId") Long newsId,
                                      @Param("currentMemberId") Long currentMemberId,
                                      @Param("sort") String sort);

    int selectCountByNewsId(Long newsId);

    void softDeleteById(@Param("id") Long id, @Param("memberId") Long memberId);

    int updateContentById(@Param("id") Long id,
                          @Param("memberId") Long memberId,
                          @Param("content") String content);
}
