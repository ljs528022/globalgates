package com.app.globalgates.repository;

import com.app.globalgates.dto.PostHashtagDTO;
import com.app.globalgates.mapper.PostHashtagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostHashtagDAO {
    private final PostHashtagMapper postHashtagMapper;

    //    태그 추가 (없으면 생성, 있으면 무시)
    public void save(PostHashtagDTO postHashtagDTO) {
        postHashtagMapper.insert(postHashtagDTO);
    }

    //    태그명으로 조회
    public Optional<PostHashtagDTO> findByTagName(String tagName) {
        return postHashtagMapper.selectByTagName(tagName);
    }

    //    전체 태그 목록 조회
    public List<PostHashtagDTO> findAll() {
        return postHashtagMapper.selectAll();
    }

    //    게시글에 연결된 태그 목록 조회
    public List<PostHashtagDTO> findAllByPostId(Long postId) {
        return postHashtagMapper.selectAllByPostId(postId);
    }

    //    게시글-태그 관계 추가
    public void saveRel(Long postId, Long hashtagId) {
        postHashtagMapper.insertRel(postId, hashtagId);
    }

    //    게시글-태그 관계 전체 삭제
    public void deleteRelByPostId(Long postId) {
        postHashtagMapper.deleteRelByPostId(postId);
    }
}
