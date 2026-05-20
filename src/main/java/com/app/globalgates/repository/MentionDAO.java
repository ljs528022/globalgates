package com.app.globalgates.repository;

import com.app.globalgates.dto.MentionDTO;
import com.app.globalgates.mapper.MentionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MentionDAO {
    private final MentionMapper mentionMapper;

    //    멘션 저장
    public void save(MentionDTO mentionDTO) {
        mentionMapper.insert(mentionDTO);
    }

    //    게시물의 멘션 삭제
    public void deleteByPostId(Long postId) {
        mentionMapper.deleteByPostId(postId);
    }

    //    게시물의 멘션 조회
    public List<MentionDTO> findByPostId(Long postId) {
        return mentionMapper.selectByPostId(postId);
    }

    //    멘션 검색 (handle 검색)
    public List<MentionDTO> searchForMention(String keyword, Long memberId) {
        return mentionMapper.selectMembersForMention(keyword, memberId);
    }
}
