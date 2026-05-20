package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsLikeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface NewsLikeMapper {
    void insert(NewsLikeDTO newsLikeDTO);

    void deleteByMemberIdAndNewsId(@Param("memberId") Long memberId, @Param("newsId") Long newsId);

    Optional<NewsLikeDTO> selectByMemberIdAndNewsId(@Param("memberId") Long memberId, @Param("newsId") Long newsId);

    int selectCountByNewsId(Long newsId);
}
