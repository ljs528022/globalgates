package com.app.globalgates.repository;

import com.app.globalgates.dto.PostTempDTO;
import com.app.globalgates.mapper.PostTempMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostTempDAO {
    private final PostTempMapper postTempMapper;

//    저장
    public void save(PostTempDTO postTempDTO) {
        postTempMapper.insert(postTempDTO);
    }

//    단건 조회
    public Optional<PostTempDTO> findById(Long id) {
        return postTempMapper.selectById(id);
    }

//    회원의 임시저장 목록 조회
    public List<PostTempDTO> findAllByMemberId(Long memberId) {
        return postTempMapper.selectAllByMemberId(memberId);
    }

//    개별 삭제
    public void delete(Long id) {
        postTempMapper.delete(id);
    }

//    회원 전체 삭제
    public void deleteAllByMemberId(Long memberId) {
        postTempMapper.deleteAllByMemberId(memberId);
    }
}
