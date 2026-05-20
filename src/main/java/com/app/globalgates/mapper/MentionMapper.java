package com.app.globalgates.mapper;

import com.app.globalgates.dto.MentionDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MentionMapper {
    //    멘션 저장
    public void insert(MentionDTO mentionDTO);

    //    게시물의 멘션 삭제
    public void deleteByPostId(Long postId);

    //    게시물의 멘션 조회
    public List<MentionDTO> selectByPostId(Long postId);

    //    멘션 검색 (member_handle로, 양방향 차단 제외, 최대 10개)
    public List<MentionDTO> selectMembersForMention(@Param("keyword") String keyword, @Param("memberId") Long memberId);
}
