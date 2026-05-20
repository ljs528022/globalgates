package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsReplyLikeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface NewsReplyLikeMapper {
    void insert(NewsReplyLikeDTO newsReplyLikeDTO);

    void deleteByMemberIdAndReplyId(@Param("memberId") Long memberId, @Param("replyId") Long replyId);

    Optional<NewsReplyLikeDTO> selectByMemberIdAndReplyId(@Param("memberId") Long memberId, @Param("replyId") Long replyId);
}
